-- Migration: Create storage bucket for portfolio images
-- Execute this in Supabase SQL Editor

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images', 
  'portfolio-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for public read access
CREATE POLICY "Public images access" ON storage.objects 
FOR SELECT USING (bucket_id = 'portfolio-images');

-- Create policies for authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-images' AND 
  auth.role() = 'authenticated'
);

-- Create policies for authenticated users to update
CREATE POLICY "Authenticated users can update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'portfolio-images' AND 
  auth.role() = 'authenticated'
);

-- Create policies for authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'portfolio-images' AND 
  auth.role() = 'authenticated'
);
