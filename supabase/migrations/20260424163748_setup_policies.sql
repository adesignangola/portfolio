-- Enable RLS on all tables
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE quemsou ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Enable read access for all users" ON perfil FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON quemsou FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON slides FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON servicos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON projectos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON metricas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON depoimentos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON contactos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sectores FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON paises FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ferramentas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON parceiros FOR SELECT USING (true);