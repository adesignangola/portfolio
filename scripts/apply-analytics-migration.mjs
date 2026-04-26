import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAnalyticsMigration() {
  try {
    console.log('🚀 Aplicando migration do analytics...');
    
    // Ler o arquivo de migration
    const migrationPath = join(__dirname, '../supabase/migrations/20260425140000_analytics_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Executar a migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao aplicar migration:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration do analytics aplicada com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - analytics_events');
    console.log('   - user_sessions');
    console.log('   - content_performance');
    console.log('   - daily_metrics');
    console.log('   - Funções e triggers automáticos');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    process.exit(1);
  }
}

applyAnalyticsMigration();
