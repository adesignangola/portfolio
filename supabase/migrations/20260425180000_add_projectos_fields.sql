-- Add new fields to projectos table
-- Run this migration in Supabase Dashboard > SQL Editor

ALTER TABLE public.projectos 
ADD COLUMN IF NOT EXISTS concepto TEXT,
ADD COLUMN IF NOT EXISTS duracao TEXT,
ADD COLUMN IF NOT EXISTS ferramentas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cores TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS agencia TEXT,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Update RLS policies if needed (projectos should already be writable)
GRANT ALL ON public.projectos TO authenticated;
GRANT ALL ON public.projectos TO anon;