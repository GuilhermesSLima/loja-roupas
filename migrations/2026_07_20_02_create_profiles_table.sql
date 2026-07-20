/* Migration: Create or update public.profiles table for multi-tenant administrators */

-- Create profiles table referencing auth.users and public.loja
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  loja_id uuid REFERENCES public.loja(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure all required columns exist in case the table already existed with a different schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loja_id uuid REFERENCES public.loja(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
