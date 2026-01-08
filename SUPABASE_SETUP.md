# Supabase Setup Guide for Image Upload

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `jit-estate` (or any name you prefer)
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Name it: `images`
4. Make it **Public** (so images can be accessed via URL)
5. Click "Create bucket"

## Step 4: Set Up Storage Policies (Important!)

1. Go to **Storage** → **Policies** for the `images` bucket
2. Click "New Policy"
3. Create a policy that allows:
   - **INSERT**: Authenticated users can upload
   - **SELECT**: Public can read (since bucket is public)
4. Or use this SQL in the SQL Editor:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public to read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

## Step 5: Add Environment Variables

1. In your `client` folder, create or update `.env` file:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Make sure `.env` is in your `.gitignore` file

## Step 6: Test the Setup

1. Start your backend: `npm run dev` (from root)
2. Start your frontend: `cd client && npm run dev`
3. Navigate to the Profile page
4. Click on the profile image to upload a new one
5. The image should upload to Supabase and update in your profile

## Troubleshooting

- **Error: "Missing Supabase environment variables"**
  - Make sure your `.env` file is in the `client` folder
  - Restart your dev server after adding environment variables

- **Error: "Bucket not found"**
  - Make sure you created a bucket named `images` in Supabase Storage
  - Check that the bucket is set to Public

- **Error: "Policy violation"**
  - Check your Storage policies in Supabase
  - Make sure authenticated users can INSERT and public can SELECT

- **Images not showing**
  - Check that the bucket is set to Public
  - Verify the URL is correct in the browser console

