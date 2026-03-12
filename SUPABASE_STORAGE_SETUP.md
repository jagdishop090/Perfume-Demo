# Supabase Storage Setup Guide

Since the storage bucket cannot be created programmatically due to RLS policies, you need to set it up manually in the Supabase dashboard.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following configuration:
   - **Name**: `perfume-images`
   - **Public bucket**: ✅ **Enabled** (This is important!)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

## Step 2: Set Storage Policies

After creating the bucket, you need to set up RLS policies:

1. Go to **Storage** → **Policies**
2. Create the following policies for the `perfume-images` bucket:

### Policy 1: Allow Public Uploads
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'perfume-images');
```

### Policy 2: Allow Public Downloads
```sql
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'perfume-images');
```

### Policy 3: Allow Public Updates
```sql
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'perfume-images');
```

### Policy 4: Allow Public Deletes
```sql
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'perfume-images');
```

## Step 3: Test the Setup

After setting up the bucket and policies, test the image upload functionality:

1. Go to `http://localhost:3000/admin`
2. Login with `admin` / `admin123`
3. Try uploading an image in the Hero Banners or Products section
4. Check if the image uploads successfully and displays properly

## Alternative: SQL Setup (Advanced)

If you prefer to set up via SQL, run this in your Supabase SQL Editor:

```sql
-- Create storage bucket (may fail due to RLS, create manually if needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'perfume-images', 
  'perfume-images', 
  true, 
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'perfume-images');

CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'perfume-images');

CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'perfume-images');

CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'perfume-images');
```

## Troubleshooting

### Error: "Storage bucket not configured"
- Make sure you created the `perfume-images` bucket in Supabase dashboard
- Ensure the bucket is set to **public**

### Error: "Storage permissions error"
- Check that all 4 RLS policies are created for the bucket
- Verify the policies allow public access (no authentication required)

### Error: "Upload failed"
- Check file size (must be under 5MB)
- Verify file type is supported (JPG, PNG, WebP, GIF)
- Check browser console for detailed error messages

## File Organization

Images will be organized in the bucket as follows:
- `banners/` - Hero banner images
- `products/` - Product images
- `general/` - Other uploads

Each file gets a unique name with timestamp to prevent conflicts.