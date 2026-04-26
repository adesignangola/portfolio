-- ============================================
-- ATIVAR REALTIME PARA TODAS AS TABELAS DO CMS
-- Execute isto no Editor SQL Supabase
-- ============================================

-- Remover publicação existente se existir
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Criar nova publicação com todas as tabelas
CREATE PUBLICATION supabase_realtime FOR TABLE 
  perfil,
  quemsou,
  configuracoes,
  slides,
  servicos,
  projectos,
  metricas,
  depoimentos,
  contactos,
  sectores,
  paises,
  ferramentas,
  parceiros;

-- Verificar se a publicação foi criada corretamente
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
