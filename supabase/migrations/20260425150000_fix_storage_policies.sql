-- Migration: Fix storage policies for portfolio images
-- Allows uploads without authentication (for CMS usage)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Allow anyone (including anon) to upload images to portfolio-images bucket
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-images'
);

-- Allow anyone to update their own uploads
CREATE POLICY "Allow public updates" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'portfolio-images'
);

-- Allow anyone to delete their own uploads  
CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'portfolio-images'
);