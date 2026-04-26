-- Migration: Update projectos.imagemDestaque to support multiple images
-- Execute this in Supabase SQL Editor after deployment

-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS projectos_backup AS SELECT * FROM projectos;

-- Add new array column (temporary)
ALTER TABLE projectos ADD COLUMN IF NOT EXISTS imagem_destaque_array TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing single image to array
UPDATE projectos 
SET imagem_destaque_array = CASE 
  WHEN imagemDestaque IS NOT NULL AND imagemDestaque != '' 
  THEN ARRAY[imagemDestaque] 
  ELSE ARRAY[]::TEXT[]
END;

-- Drop old column
ALTER TABLE projectos DROP COLUMN IF EXISTS imagemDestaque;

-- Rename new column to original name
ALTER TABLE projectos RENAME COLUMN imagem_destaque_array TO imagemDestaque;

-- Update the sample data if needed
UPDATE projectos 
SET imagemDestaque = ARRAY['https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800']
WHERE titulo = 'IDENTIDADE KERO' AND array_length(imagemDestaque, 1) = 0;
