-- Create mensagens table for contact form
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  mensagem TEXT NOT NULL,
  tipo_origem TEXT DEFAULT 'site',
  lida BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Enable read access for all users" ON mensagens FOR SELECT USING (true);

-- Public insert policy
CREATE POLICY "Enable insert for all users" ON mensagens FOR INSERT WITH CHECK (true);

-- Admin update policy
CREATE POLICY "Enable update for all users" ON mensagens FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON mensagens FOR DELETE USING (true);

-- Grants
GRANT ALL ON public.mensagens TO authenticated;
GRANT ALL ON public.mensagens TO anon;