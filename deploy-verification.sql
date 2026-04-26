-- VERIFICATION SCRIPT - Execute in Supabase SQL Editor after deploy
-- This script verifies that all migrations were applied successfully

-- 1. Check if all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'perfil', 'quemsou', 'slides', 'servicos', 'projectos', 
    'metricas', 'depoimentos', 'contactos', 'configuracoes',
    'sectores', 'paises', 'ferramentas', 'parceiros'
)
ORDER BY table_name;

-- 2. Check if projectos table has the new array column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projectos' 
AND column_name = 'imagemdestaque';

-- 3. Check if storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'portfolio-images';

-- 4. Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'perfil', 'quemsou', 'slides', 'servicos', 'projectos', 
    'metricas', 'depoimentos', 'contactos', 'configuracoes',
    'sectores', 'paises', 'ferramentas', 'parceiros'
)
ORDER BY tablename;

-- 5. Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Test data - Check sample data
SELECT 'servicos' as table_name, COUNT(*) as count FROM servicos
UNION ALL
SELECT 'projectos', COUNT(*) FROM projectos  
UNION ALL
SELECT 'metricas', COUNT(*) FROM metricas
UNION ALL
SELECT 'depoimentos', COUNT(*) FROM depoimentos
UNION ALL
SELECT 'contactos', COUNT(*) FROM contactos
UNION ALL
SELECT 'sectores', COUNT(*) FROM sectores
UNION ALL
SELECT 'paises', COUNT(*) FROM paises
UNION ALL
SELECT 'ferramentas', COUNT(*) FROM ferramentas
UNION ALL
SELECT 'parceiros', COUNT(*) FROM parceiros
ORDER BY table_name;

-- 7. Check if projectos has array data
SELECT titulo, array_length(imagemdestaque, 1) as image_count, imagemdestaque
FROM projectos 
WHERE array_length(imagemdestaque, 1) > 0
LIMIT 5;

-- 8. Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- SUCCESS MESSAGE
SELECT '✅ DEPLOY VERIFICATION COMPLETE - Check results above' as status;
