# Supabase Connection Guide

Follow these steps to migrate your dashbaord from Local Storage to a real Supabase database.

## 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Create a new project named `ZilSeo`.
3. Set your database password and wait for the project to provision.

## 2. Run the SQL Schema
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Click **New Query**.
3. Copy the entire content of the `supabase_schema.sql` file (located in your project root) and paste it into the editor.
4. Click **Run**. This will create all your tables (`websites`, `pages`, `posts`, `social_links`, `work_items`) and set up security policies.

## 3. Get Your API Keys
1. Go to **Project Settings** > **API**.
2. Copy the **Project URL**.
3. Copy the `anon` **public** Key.

## 4. Configure Your Environment Variables
Open your `.env.local` file in the project root and add the following lines (replace with your actual keys):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 5. What's Next?
I have already:
- ✅ Created `services/supabaseClient.ts` to connect to your database.
- ✅ Updated `supabase_schema.sql` with all the necessary tables for Social Media and Work verification.

I am now ready to start implementing the `SupabaseService` to persist your real-time data!
