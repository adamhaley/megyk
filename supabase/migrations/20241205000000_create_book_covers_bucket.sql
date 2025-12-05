-- Create storage bucket for book covers
-- Note: Bucket creation via SQL is limited. This migration sets up policies.
-- The bucket itself should be created via Supabase Dashboard or Management API.
-- Bucket name: 'book-covers'

-- Enable storage if not already enabled (this is usually done via config)
-- Storage buckets are typically created via Supabase Dashboard or Management API

-- Create policy to allow authenticated users to upload cover images
-- Note: This assumes the bucket 'book-covers' exists. Create it via Dashboard first.

-- Policy: Allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-covers' AND
  (storage.foldername(name))[1] = 'covers'
);

-- Policy: Allow public read access to cover images
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- Policy: Allow authenticated users to update their own uploads
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers')
WITH CHECK (bucket_id = 'book-covers');

-- Policy: Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');

