-- Analytics Schema Migration
-- Tabelas para rastreamento de analytics e monitoramento do portfolio

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('slide_view', 'project_click', 'contact_click', 'testimonial_view', 'session_start', 'session_end')),
  slide_number INTEGER,
  content_id TEXT,
  content_type TEXT CHECK (content_type IN ('projecto', 'servico', 'depoimento', 'contacto')),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  referrer TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  country TEXT,
  city TEXT,
  total_slides_viewed INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  completed_presentation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de desempenho de conteúdo
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('projecto', 'servico', 'depoimento', 'contacto')),
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  avg_view_duration_seconds INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, content_type)
);

-- Tabela de métricas diárias
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  top_slide INTEGER,
  top_content_id TEXT,
  top_content_type TEXT,
  countries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_content_performance_content_id ON content_performance(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);

-- RLS (Row Level Security) Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events (inserção pública, leitura apenas para autenticados)
CREATE POLICY "Public insert for analytics_events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read for analytics_events" ON analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para user_sessions (inserção pública, leitura apenas para autenticados)
CREATE POLICY "Public insert for user_sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read for user_sessions" ON user_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para content_performance (inserção pública, leitura apenas para autenticados)
CREATE POLICY "Public insert for content_performance" ON content_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read for content_performance" ON content_performance
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para daily_metrics (apenas para autenticados)
CREATE POLICY "Authenticated full access for daily_metrics" ON daily_metrics
  FOR ALL USING (auth.role() = 'authenticated');

-- Função para atualizar content_performance automaticamente
CREATE OR REPLACE FUNCTION update_content_performance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_performance (content_id, content_type, total_views, last_viewed_at)
  VALUES (NEW.content_id, NEW.content_type, 1, NEW.created_at)
  ON CONFLICT (content_id, content_type)
  DO UPDATE SET
    total_views = content_performance.total_views + 1,
    last_viewed_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar content_performance
CREATE TRIGGER trigger_update_content_performance
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'slide_view' AND NEW.content_id IS NOT NULL)
  EXECUTE FUNCTION update_content_performance();

-- Função para limpar dados antigos (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Remover eventos de analytics com mais de 90 dias
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remover sessões com mais de 90 dias
  DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Manter apenas métricas diárias dos últimos 2 anos
  DELETE FROM daily_metrics WHERE date < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Função para calcular métricas diárias automaticamente
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  session_count INTEGER;
  unique_visitors INTEGER;
  total_views INTEGER;
  avg_duration INTEGER;
  bounce_rate DECIMAL(5,2);
  conversion_rate DECIMAL(5,2);
  top_slide INTEGER;
  top_content RECORD;
BEGIN
  -- Contar sessões do dia
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE DATE(created_at) = target_date;
  
  -- Contar visitantes únicos
  SELECT COUNT(DISTINCT session_id) INTO unique_visitors
  FROM analytics_events
  WHERE DATE(created_at) = target_date;
  
  -- Contar visualizações totais
  SELECT COUNT(*) INTO total_views
  FROM analytics_events
  WHERE DATE(created_at) = target_date AND event_type = 'slide_view';
  
  -- Calcular duração média
  SELECT COALESCE(AVG(duration_seconds), 0) INTO avg_duration
  FROM user_sessions
  WHERE DATE(created_at) = target_date AND duration_seconds IS NOT NULL;
  
  -- Calcular bounce rate (sessões com apenas 1 slide)
  SELECT COALESCE(
    ROUND(COUNT(CASE WHEN total_slides_viewed <= 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2), 0
  ) INTO bounce_rate
  FROM user_sessions
  WHERE DATE(created_at) = target_date;
  
  -- Calcular conversion rate (sessões com cliques em contato)
  SELECT COALESCE(
    ROUND(COUNT(CASE WHEN total_interactions > 0 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2), 0
  ) INTO conversion_rate
  FROM user_sessions
  WHERE DATE(created_at) = target_date;
  
  -- Encontrar slide mais visualizado
  SELECT slide_number INTO top_slide
  FROM analytics_events
  WHERE DATE(created_at) = target_date AND event_type = 'slide_view' AND slide_number IS NOT NULL
  GROUP BY slide_number
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  -- Encontrar conteúdo mais popular
  SELECT content_id, content_type INTO top_content
  FROM content_performance
  WHERE DATE(updated_at) = target_date
  ORDER BY total_views DESC, last_viewed_at DESC
  LIMIT 1;
  
  -- Inserir ou atualizar métricas diárias
  INSERT INTO daily_metrics (
    date, total_sessions, unique_visitors, total_page_views,
    avg_session_duration_seconds, bounce_rate, conversion_rate,
    top_slide, top_content_id, top_content_type,
    countries_count, updated_at
  ) VALUES (
    target_date, session_count, unique_visitors, total_views,
    avg_duration, bounce_rate, conversion_rate,
    top_slide, top_content.content_id, top_content.content_type,
    (SELECT COUNT(DISTINCT country) FROM user_sessions WHERE DATE(created_at) = target_date AND country IS NOT NULL),
    NOW()
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    unique_visitors = EXCLUDED.unique_visitors,
    total_page_views = EXCLUDED.total_page_views,
    avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
    bounce_rate = EXCLUDED.bounce_rate,
    conversion_rate = EXCLUDED.conversion_rate,
    top_slide = EXCLUDED.top_slide,
    top_content_id = EXCLUDED.top_content_id,
    top_content_type = EXCLUDED.top_content_type,
    countries_count = EXCLUDED.countries_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
