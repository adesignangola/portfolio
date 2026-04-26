-- ============================================
-- SECURE CMS AUTH + ADMIN WRITE ACCESS
-- ============================================
-- 1. Admins autenticam via Supabase Auth
-- 2. Apenas emails allowlisted podem escrever
-- 3. Escritas do CMS passam por backend seguro

CREATE TABLE IF NOT EXISTS public.cms_admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cms_admin_emails_lowercase CHECK (email = lower(email))
);

ALTER TABLE public.cms_admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CMS admins can read own allowlist entry" ON public.cms_admin_emails;
CREATE POLICY "CMS admins can read own allowlist entry"
ON public.cms_admin_emails
FOR SELECT
TO authenticated
USING (email = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cms_admin_emails
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_cms_admin() TO anon, authenticated, service_role;

-- --------------------------------------------
-- Remove escrita pública antiga
-- --------------------------------------------

DROP POLICY IF EXISTS "Public insert" ON public.perfil;
DROP POLICY IF EXISTS "Public update" ON public.perfil;
DROP POLICY IF EXISTS "Public delete" ON public.perfil;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.perfil;
DROP POLICY IF EXISTS "Enable update for all users" ON public.perfil;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.perfil;

DROP POLICY IF EXISTS "Public insert" ON public.quemsou;
DROP POLICY IF EXISTS "Public update" ON public.quemsou;
DROP POLICY IF EXISTS "Public delete" ON public.quemsou;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.quemsou;
DROP POLICY IF EXISTS "Enable update for all users" ON public.quemsou;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.quemsou;

DROP POLICY IF EXISTS "Public insert" ON public.configuracoes;
DROP POLICY IF EXISTS "Public update" ON public.configuracoes;
DROP POLICY IF EXISTS "Public delete" ON public.configuracoes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.configuracoes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.configuracoes;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.configuracoes;

DROP POLICY IF EXISTS "Public insert" ON public.slides;
DROP POLICY IF EXISTS "Public update" ON public.slides;
DROP POLICY IF EXISTS "Public delete" ON public.slides;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.slides;
DROP POLICY IF EXISTS "Enable update for all users" ON public.slides;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.slides;

DROP POLICY IF EXISTS "Public insert" ON public.servicos;
DROP POLICY IF EXISTS "Public update" ON public.servicos;
DROP POLICY IF EXISTS "Public delete" ON public.servicos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.servicos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.servicos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.servicos;

DROP POLICY IF EXISTS "Public insert" ON public.projectos;
DROP POLICY IF EXISTS "Public update" ON public.projectos;
DROP POLICY IF EXISTS "Public delete" ON public.projectos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projectos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.projectos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.projectos;

DROP POLICY IF EXISTS "Public insert" ON public.metricas;
DROP POLICY IF EXISTS "Public update" ON public.metricas;
DROP POLICY IF EXISTS "Public delete" ON public.metricas;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.metricas;
DROP POLICY IF EXISTS "Enable update for all users" ON public.metricas;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.metricas;

DROP POLICY IF EXISTS "Public insert" ON public.depoimentos;
DROP POLICY IF EXISTS "Public update" ON public.depoimentos;
DROP POLICY IF EXISTS "Public delete" ON public.depoimentos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.depoimentos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.depoimentos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.depoimentos;

DROP POLICY IF EXISTS "Public insert" ON public.contactos;
DROP POLICY IF EXISTS "Public update" ON public.contactos;
DROP POLICY IF EXISTS "Public delete" ON public.contactos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contactos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.contactos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.contactos;

DROP POLICY IF EXISTS "Public insert" ON public.sectores;
DROP POLICY IF EXISTS "Public update" ON public.sectores;
DROP POLICY IF EXISTS "Public delete" ON public.sectores;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.sectores;
DROP POLICY IF EXISTS "Enable update for all users" ON public.sectores;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.sectores;

DROP POLICY IF EXISTS "Public insert" ON public.paises;
DROP POLICY IF EXISTS "Public update" ON public.paises;
DROP POLICY IF EXISTS "Public delete" ON public.paises;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.paises;
DROP POLICY IF EXISTS "Enable update for all users" ON public.paises;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.paises;

DROP POLICY IF EXISTS "Public insert" ON public.ferramentas;
DROP POLICY IF EXISTS "Public update" ON public.ferramentas;
DROP POLICY IF EXISTS "Public delete" ON public.ferramentas;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.ferramentas;
DROP POLICY IF EXISTS "Enable update for all users" ON public.ferramentas;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.ferramentas;

DROP POLICY IF EXISTS "Public insert" ON public.parceiros;
DROP POLICY IF EXISTS "Public update" ON public.parceiros;
DROP POLICY IF EXISTS "Public delete" ON public.parceiros;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.parceiros;
DROP POLICY IF EXISTS "Enable update for all users" ON public.parceiros;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.parceiros;

-- --------------------------------------------
-- Escrita apenas para admins autenticados
-- --------------------------------------------

DROP POLICY IF EXISTS "CMS admins can insert perfil" ON public.perfil;
DROP POLICY IF EXISTS "CMS admins can update perfil" ON public.perfil;
CREATE POLICY "CMS admins can insert perfil"
ON public.perfil
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update perfil"
ON public.perfil
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert quemsou" ON public.quemsou;
DROP POLICY IF EXISTS "CMS admins can update quemsou" ON public.quemsou;
CREATE POLICY "CMS admins can insert quemsou"
ON public.quemsou
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update quemsou"
ON public.quemsou
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "CMS admins can update configuracoes" ON public.configuracoes;
CREATE POLICY "CMS admins can insert configuracoes"
ON public.configuracoes
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update configuracoes"
ON public.configuracoes
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert slides" ON public.slides;
DROP POLICY IF EXISTS "CMS admins can update slides" ON public.slides;
CREATE POLICY "CMS admins can insert slides"
ON public.slides
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update slides"
ON public.slides
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert servicos" ON public.servicos;
DROP POLICY IF EXISTS "CMS admins can update servicos" ON public.servicos;
DROP POLICY IF EXISTS "CMS admins can delete servicos" ON public.servicos;
CREATE POLICY "CMS admins can insert servicos"
ON public.servicos
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update servicos"
ON public.servicos
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete servicos"
ON public.servicos
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert projectos" ON public.projectos;
DROP POLICY IF EXISTS "CMS admins can update projectos" ON public.projectos;
DROP POLICY IF EXISTS "CMS admins can delete projectos" ON public.projectos;
CREATE POLICY "CMS admins can insert projectos"
ON public.projectos
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update projectos"
ON public.projectos
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete projectos"
ON public.projectos
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert metricas" ON public.metricas;
DROP POLICY IF EXISTS "CMS admins can update metricas" ON public.metricas;
DROP POLICY IF EXISTS "CMS admins can delete metricas" ON public.metricas;
CREATE POLICY "CMS admins can insert metricas"
ON public.metricas
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update metricas"
ON public.metricas
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete metricas"
ON public.metricas
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "CMS admins can update depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "CMS admins can delete depoimentos" ON public.depoimentos;
CREATE POLICY "CMS admins can insert depoimentos"
ON public.depoimentos
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update depoimentos"
ON public.depoimentos
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete depoimentos"
ON public.depoimentos
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert contactos" ON public.contactos;
DROP POLICY IF EXISTS "CMS admins can update contactos" ON public.contactos;
DROP POLICY IF EXISTS "CMS admins can delete contactos" ON public.contactos;
CREATE POLICY "CMS admins can insert contactos"
ON public.contactos
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update contactos"
ON public.contactos
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete contactos"
ON public.contactos
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert sectores" ON public.sectores;
DROP POLICY IF EXISTS "CMS admins can update sectores" ON public.sectores;
DROP POLICY IF EXISTS "CMS admins can delete sectores" ON public.sectores;
CREATE POLICY "CMS admins can insert sectores"
ON public.sectores
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update sectores"
ON public.sectores
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete sectores"
ON public.sectores
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert paises" ON public.paises;
DROP POLICY IF EXISTS "CMS admins can update paises" ON public.paises;
DROP POLICY IF EXISTS "CMS admins can delete paises" ON public.paises;
CREATE POLICY "CMS admins can insert paises"
ON public.paises
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update paises"
ON public.paises
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete paises"
ON public.paises
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert ferramentas" ON public.ferramentas;
DROP POLICY IF EXISTS "CMS admins can update ferramentas" ON public.ferramentas;
DROP POLICY IF EXISTS "CMS admins can delete ferramentas" ON public.ferramentas;
CREATE POLICY "CMS admins can insert ferramentas"
ON public.ferramentas
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update ferramentas"
ON public.ferramentas
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete ferramentas"
ON public.ferramentas
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

DROP POLICY IF EXISTS "CMS admins can insert parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "CMS admins can update parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "CMS admins can delete parceiros" ON public.parceiros;
CREATE POLICY "CMS admins can insert parceiros"
ON public.parceiros
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can update parceiros"
ON public.parceiros
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());
CREATE POLICY "CMS admins can delete parceiros"
ON public.parceiros
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

-- --------------------------------------------
-- Storage: uploads apenas por admins autenticados
-- --------------------------------------------

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "CMS admins can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "CMS admins can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "CMS admins can delete portfolio images" ON storage.objects;

CREATE POLICY "CMS admins can upload portfolio images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND public.is_cms_admin()
);

CREATE POLICY "CMS admins can update portfolio images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND public.is_cms_admin()
)
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND public.is_cms_admin()
);

CREATE POLICY "CMS admins can delete portfolio images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND public.is_cms_admin()
);

-- --------------------------------------------
-- Setup manual inicial
-- --------------------------------------------
-- Depois de correr esta migration, adiciona pelo menos um email admin:
-- insert into public.cms_admin_emails (email) values ('teu-email@dominio.com')
-- on conflict (email) do nothing;
