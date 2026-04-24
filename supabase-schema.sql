-- ============================================
-- PORTFOLIO CMS - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: perfil
-- ============================================
CREATE TABLE IF NOT EXISTS perfil (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fotografia TEXT,
  nomeCompleto TEXT NOT NULL,
  destaqueNome TEXT,
  eyebrowEntrada TEXT,
  tagline TEXT,
  biografia TEXT,
  labelBotaoInicio TEXT DEFAULT 'Começar',
  labelBotaoAcaoFinal TEXT DEFAULT 'Solicitar Orçamento',
  anoPortfolio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: quemsou
-- ============================================
CREATE TABLE IF NOT EXISTS quemsou (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nomePrimeiraLinha TEXT NOT NULL DEFAULT 'Adilson',
  nomeDestaque TEXT NOT NULL DEFAULT 'Pinto',
  biografia TEXT,
  fotografia TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: slides
-- ============================================
CREATE TABLE IF NOT EXISTS slides (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: servicos
-- ============================================
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  corFundo TEXT DEFAULT 'azul-escuro',
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: projectos
-- ============================================
CREATE TABLE IF NOT EXISTS projectos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT DEFAULT 'Design',
  nomeCliente TEXT,
  ano TEXT DEFAULT '2025',
  imagemDestaque TEXT,
  emDestaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: metricas
-- ============================================
CREATE TABLE IF NOT EXISTS metricas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  valor TEXT NOT NULL,
  sufixo TEXT,
  legenda TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: depoimentos
-- ============================================
CREATE TABLE IF NOT EXISTS depoimentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  texto TEXT NOT NULL,
  autor TEXT NOT NULL,
  cargo TEXT,
  organizacao TEXT,
  iniciais TEXT,
  emDestaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: contactos
-- ============================================
CREATE TABLE IF NOT EXISTS contactos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo TEXT DEFAULT 'email',
  etiqueta TEXT NOT NULL,
  valor TEXT NOT NULL,
  link TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: configuracoes
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nomeAgencia TEXT,
  servicosRodape TEXT,
  processoTrabalho TEXT,
  etiquetaRodapeContacto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: sectores
-- ============================================
CREATE TABLE IF NOT EXISTS sectores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: paises
-- ============================================
CREATE TABLE IF NOT EXISTS paises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  bandeira TEXT,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: ferramentas
-- ============================================
CREATE TABLE IF NOT EXISTS ferramentas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo TEXT DEFAULT 'outras',
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: parceiros
-- ============================================
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  logo TEXT,
  link TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE quemsou ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON perfil FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quemsou FOR SELECT USING (true);
CREATE POLICY "Public read access" ON slides FOR SELECT USING (true);
CREATE POLICY "Public read access" ON servicos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projectos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON metricas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON depoimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON contactos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sectores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON paises FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ferramentas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON parceiros FOR SELECT USING (true);

-- Public write access (for CMS - PIN validation done client-side)
CREATE POLICY "Public insert" ON perfil FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON perfil FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON quemsou FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON quemsou FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON slides FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON servicos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON servicos FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON servicos FOR DELETE USING (true);
CREATE POLICY "Public insert" ON projectos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON projectos FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON projectos FOR DELETE USING (true);
CREATE POLICY "Public insert" ON metricas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON metricas FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON metricas FOR DELETE USING (true);
CREATE POLICY "Public insert" ON depoimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON depoimentos FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON depoimentos FOR DELETE USING (true);
CREATE POLICY "Public insert" ON contactos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON contactos FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON contactos FOR DELETE USING (true);
CREATE POLICY "Public insert" ON configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON configuracoes FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON sectores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON sectores FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON sectores FOR DELETE USING (true);
CREATE POLICY "Public insert" ON paises FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON paises FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON paises FOR DELETE USING (true);
CREATE POLICY "Public insert" ON ferramentas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON ferramentas FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON ferramentas FOR DELETE USING (true);
CREATE POLICY "Public insert" ON parceiros FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON parceiros FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON parceiros FOR DELETE USING (true);

-- ============================================
-- SEED DATA - Default Slides
-- ============================================
INSERT INTO slides (id, titulo, eyebrow) VALUES
  ('slide-01', 'QUEM SOU', 'Quem Sou'),
  ('slide-02', 'O QUE FAÇO', 'Expertise'),
  ('slide-03', 'NÚMEROS QUE FALAM', 'Performance'),
  ('slide-04', 'PROJETOS', 'Trabalhos'),
  ('slide-05', 'CLIENTES E SECTORES', 'Global'),
  ('slide-06', 'PARCEIROS', 'Parcerias'),
  ('slide-07', 'TESTEMUNHOS', 'Depoimentos'),
  ('slide-08', 'FERRAMENTAS', 'Tecnologias'),
  ('slide-09', 'CONTACTOS', 'Fale Comigo')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA - Sample Profile
-- ============================================
INSERT INTO perfil (fotografia, nomeCompleto, destaqueNome, eyebrowEntrada, tagline, biografia, labelBotaoInicio, labelBotaoAcaoFinal, anoPortfolio)
VALUES (
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'ADILSON PINTO AMADO',
  'PINTO',
  'DESIGNER, LUANDA, ANGOLA',
  'Criador de identidades visuais que comunicam, vendem e ficam na memória.',
  'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas.',
  'Começar',
  'Solicitar Orçamento',
  '2025'
);

-- ============================================
-- SEED DATA - Sample QuemSou
-- ============================================
INSERT INTO quemsou (nomePrimeiraLinha, nomeDestaque, biografia, fotografia, tags)
VALUES (
  'Adilson',
  'Pinto',
  'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  ARRAY['IDENTIDADE VISUAL', 'BRANDING', 'DESIGN']
);

-- ============================================
-- SEED DATA - Sample Services
-- ============================================
INSERT INTO servicos (titulo, descricao, corFundo, ordem) VALUES
  ('IDENTIDADE VISUAL', 'Criação de logos, paletas de cor, tipografia e manual de marca.', 'azul-escuro', 1),
  ('DESIGN GRÁFICO', 'Artes para redes sociais, cartazes, flyers e materiais.', 'laranja', 2);

-- ============================================
-- SEED DATA - Sample Projects
-- ============================================
INSERT INTO projectos (titulo, categoria, nomeCliente, ano, imagemDestaque, emDestaque, ordem) VALUES
  ('IDENTIDADE KERO', 'BRANDING', 'KERO', '2024', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800', true, 1);

-- ============================================
-- SEED DATA - Sample Metrics
-- ============================================
INSERT INTO metricas (valor, sufixo, legenda, ordem) VALUES
  ('5', '+', 'Anos de Experiência', 1),
  ('50', '+', 'Projetos Concluídos', 2),
  ('3', '', 'Países de Atuação', 3),
  ('100', '%', 'Satisfação Total', 4);

-- ============================================
-- SEED DATA - Sample Testimonials
-- ============================================
INSERT INTO depoimentos (texto, autor, cargo, organizacao, iniciais, emDestaque, ordem) VALUES
  ('O Adilson conseguiu captar exatamente a essência da nossa marca.', 'Helena Santos', 'Diretora de Marketing', 'Kero', 'HS', true, 1);

-- ============================================
-- SEED DATA - Sample Contacts
-- ============================================
INSERT INTO contactos (tipo, etiqueta, valor, link, ordem) VALUES
  ('email', 'Email', 'contato@adesign.ao', 'mailto:contato@adesign.ao', 1),
  ('whatsapp', 'WhatsApp', '+244 900 000 000', 'https://wa.me/244900000000', 2);

-- ============================================
-- SEED DATA - Sample Config
-- ============================================
INSERT INTO configuracoes (nomeAgencia, servicosRodape, processoTrabalho, etiquetaRodapeContacto)
VALUES (
  'A-DESIGN ANGOLA',
  'Identidade Visual • Branding • Design Gráfico • Redes Sociais',
  'Processo de trabalho: Briefing, Conceito, Desenvolvimento, Revisão e Entrega.',
  'VAMOS TRABALHAR JUNTOS'
);

-- ============================================
-- SEED DATA - Sample Sectors
-- ============================================
INSERT INTO sectores (nome, ordem) VALUES
  ('Retalho', 1),
  ('Energia', 2),
  ('Telecomunicações', 3);

-- ============================================
-- SEED DATA - Sample Countries
-- ============================================
INSERT INTO paises (nome, bandeira, descricao, ordem) VALUES
  ('Angola', '🇦🇴', 'Mercado Principal', 1),
  ('Portugal', '🇵🇹', 'Presença Internacional', 2);

-- ============================================
-- SEED DATA - Sample Tools
-- ============================================
INSERT INTO ferramentas (nome, grupo, ordem) VALUES
  ('Adobe Illustrator', 'adobe', 1),
  ('Adobe Photoshop', 'adobe', 2),
  ('Figma', 'outras', 3);

-- ============================================
-- SEED DATA - Sample Partners
-- ============================================
INSERT INTO parceiros (nome, logo, link, ordem) VALUES
  ('KERO', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop', 'https://kero.com.ao', 1);