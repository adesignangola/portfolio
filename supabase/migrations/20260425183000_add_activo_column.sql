-- Add activo column to projectos table
-- Run this in Supabase SQL Editor

ALTER TABLE public.projectos 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Also add to other tables that use ativo/activo
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.metricas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.depoimentos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.contactos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.sectores ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.paises ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.ferramentas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.parceiros ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;