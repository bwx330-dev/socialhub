-- ============================================================
-- SocialHub Database Schema for Supabase
-- ============================================================
-- Run this in the Supabase SQL Editor to set up all tables,
-- indexes, and Row Level Security (RLS) policies.
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- Extends the built-in auth.users table with app-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. CONNECTED ACCOUNTS TABLE
-- Stores OAuth tokens and metadata for Instagram/TikTok accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  platform_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_pic TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate connections for the same platform account
  UNIQUE(user_id, platform, platform_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform ON public.connected_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_active ON public.connected_accounts(is_active) WHERE is_active = TRUE;

-- RLS for connected_accounts
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON public.connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. POSTS TABLE
-- Stores both scheduled and published posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'carousel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  error_message TEXT,
  platform_post_id TEXT, -- The post ID on the platform after publishing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_account_id ON public.posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON public.posts(platform);

-- Composite index for scheduler query: find pending posts ready to publish
CREATE INDEX IF NOT EXISTS idx_posts_scheduler
  ON public.posts(status, scheduled_at)
  WHERE status = 'pending';

-- RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow full access for development & authenticated users
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all read posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all insert posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all delete posts" ON public.posts;

CREATE POLICY "Allow all read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow all insert posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Allow all delete posts" ON public.posts FOR DELETE USING (true);

-- Service role can read all posts (for scheduler)
CREATE POLICY "Service role can read all posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update all posts"
  ON public.posts FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 4. ANALYTICS CACHE TABLE
-- Caches daily analytics snapshots to reduce API calls
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  following INTEGER NOT NULL DEFAULT 0,
  posts INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  raw_data JSONB, -- Store full API response for reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One entry per account per day
  UNIQUE(account_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_cache_account_id ON public.analytics_cache(account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_id ON public.analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_date ON public.analytics_cache(date);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_account_date ON public.analytics_cache(account_id, date DESC);

-- RLS for analytics_cache
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON public.analytics_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.analytics_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all analytics (for background jobs)
CREATE POLICY "Service role can manage all analytics"
  ON public.analytics_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 5. MEDIA UPLOADS TABLE
-- Tracks uploaded media files (stored in Supabase Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type: image/jpeg, video/mp4, etc.
  file_size INTEGER NOT NULL, -- Size in bytes
  storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  public_url TEXT, -- Public URL if available
  width INTEGER, -- Image/video width
  height INTEGER, -- Image/video height
  duration NUMERIC, -- Video duration in seconds
  thumbnail_url TEXT, -- Generated thumbnail for videos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_id ON public.media_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_created_at ON public.media_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploads_file_type ON public.media_uploads(file_type);

-- RLS for media_uploads
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media"
  ON public.media_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own media"
  ON public.media_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON public.media_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- Automatically updates the updated_at column on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_connected_accounts_updated_at ON public.connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. SUPABASE STORAGE BUCKET
-- Run this separately or use the Supabase dashboard
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('media', 'media', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Users can upload media files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can view own media files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete own media files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Public media access"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'media');
