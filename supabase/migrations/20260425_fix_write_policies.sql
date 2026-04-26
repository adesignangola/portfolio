-- ============================================
-- FIX: ADD WRITE POLICIES (INSERT, UPDATE, DELETE)
-- ============================================

-- PERFIL
CREATE POLICY "Enable insert for all users" ON perfil FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON perfil FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON perfil FOR DELETE USING (true);

-- QUEMSOU
CREATE POLICY "Enable insert for all users" ON quemsou FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON quemsou FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON quemsou FOR DELETE USING (true);

-- CONFIGURACOES
CREATE POLICY "Enable insert for all users" ON configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON configuracoes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON configuracoes FOR DELETE USING (true);

-- SLIDES
CREATE POLICY "Enable insert for all users" ON slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON slides FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON slides FOR DELETE USING (true);

-- SERVICOS
CREATE POLICY "Enable insert for all users" ON servicos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON servicos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON servicos FOR DELETE USING (true);

-- PROJECTOS
CREATE POLICY "Enable insert for all users" ON projectos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON projectos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON projectos FOR DELETE USING (true);

-- METRICAS
CREATE POLICY "Enable insert for all users" ON metricas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON metricas FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON metricas FOR DELETE USING (true);

-- DEPOIMENTOS
CREATE POLICY "Enable insert for all users" ON depoimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON depoimentos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON depoimentos FOR DELETE USING (true);

-- CONTACTOS
CREATE POLICY "Enable insert for all users" ON contactos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON contactos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON contactos FOR DELETE USING (true);

-- SECTORES
CREATE POLICY "Enable insert for all users" ON sectores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON sectores FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON sectores FOR DELETE USING (true);

-- PAISES
CREATE POLICY "Enable insert for all users" ON paises FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON paises FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON paises FOR DELETE USING (true);

-- FERRAMENTAS
CREATE POLICY "Enable insert for all users" ON ferramentas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON ferramentas FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON ferramentas FOR DELETE USING (true);

-- PARCEIROS
CREATE POLICY "Enable insert for all users" ON parceiros FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON parceiros FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON parceiros FOR DELETE USING (true);
