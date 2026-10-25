-- ==============================================================================
-- ART PORTFOLIO & CREATIVE GALLERY SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- FUNCTION: Update timestamp trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLE: profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to verify admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN current_role IN ('admin', 'editor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Automatically create profile entry when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- First user or designated user becomes admin
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles Policies
CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile or admins can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: categories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  cover_storage_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- Categories Policies
CREATE POLICY "Public can view active categories or admins view all"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: artworks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  short_description TEXT,
  description TEXT,
  main_image_url TEXT NOT NULL,
  main_storage_path TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  external_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_artworks_slug ON public.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_category_id ON public.artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_is_featured ON public.artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_artworks_is_published ON public.artworks(is_published);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_sort_order ON public.artworks(sort_order);

-- Artworks Policies
CREATE POLICY "Public can view published artworks or admins view all"
  ON public.artworks FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert artworks"
  ON public.artworks FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update artworks"
  ON public.artworks FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete artworks"
  ON public.artworks FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: artwork_images (Multiple images per artwork)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.artwork_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON public.artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_images_sort_order ON public.artwork_images(sort_order);

-- Artwork Images Policies
CREATE POLICY "Public can view images for published artworks or admins view all"
  ON public.artwork_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artworks a
      WHERE a.id = artwork_images.artwork_id
      AND (a.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can insert artwork images"
  ON public.artwork_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update artwork images"
  ON public.artwork_images FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete artwork images"
  ON public.artwork_images FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: services
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  storage_path TEXT,
  icon TEXT DEFAULT 'Sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON public.services(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- Services Policies
CREATE POLICY "Public can view active services or admins view all"
  ON public.services FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert services"
  ON public.services FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete services"
  ON public.services FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: contact_messages
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  discord_username TEXT,
  project_type TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Contact Messages Policies
-- Public can ONLY insert messages
CREATE POLICY "Public can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can view, update, delete contact messages
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- TABLE: site_settings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'LUMINA // Creative Studio',
  site_logo_url TEXT,
  site_logo_storage_path TEXT,
  favicon_url TEXT,
  site_description TEXT DEFAULT 'Award-winning digital art, characters, and stream design studio.',
  hero_label TEXT DEFAULT 'DIGITAL ART & CREATIVE DESIGN',
  hero_heading TEXT DEFAULT 'Creative Art That Brings Ideas To Life',
  hero_description TEXT DEFAULT 'A curated collection of characters, artwork, overlays, avatars, covers and digital designs crafted with obsession.',
  hero_image_url TEXT,
  primary_cta_text TEXT DEFAULT 'Explore Portfolio',
  primary_cta_link TEXT DEFAULT '/gallery',
  secondary_cta_text TEXT DEFAULT 'Start a Project',
  secondary_cta_link TEXT DEFAULT '/contact',
  about_heading TEXT DEFAULT 'Crafting Immersive Visual Identities & Digital Worlds',
  about_description TEXT DEFAULT 'We specialize in bringing original characters, stream aesthetics, and virtual identities to life through top-tier illustration and 3D design.',
  about_image_url TEXT,
  experience_text TEXT DEFAULT 'Over 7 years transforming creative visions into breathtaking digital realities.',
  stats_projects TEXT DEFAULT '500+',
  stats_clients TEXT DEFAULT '120+',
  stats_categories TEXT DEFAULT '12+',
  contact_email TEXT DEFAULT 'artist@luminastudio.art',
  discord TEXT DEFAULT 'lumina_artist#0001',
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT DEFAULT 'https://instagram.com',
  facebook TEXT,
  twitter TEXT DEFAULT 'https://x.com',
  tiktok TEXT,
  youtube TEXT DEFAULT 'https://youtube.com',
  behance TEXT DEFAULT 'https://behance.net',
  artstation TEXT DEFAULT 'https://artstation.com',
  footer_text TEXT DEFAULT 'Elevating digital presence with bespoke characters, virtual avatars, and custom stream branding.',
  copyright_text TEXT DEFAULT '© 2026 LUMINA Creative Studio. All rights reserved.',
  primary_color TEXT DEFAULT '#8b5cf6',
  secondary_color TEXT DEFAULT '#ec4899',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Site Settings Policies
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Run via Supabase Dashboard or API)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('artworks', 'artworks', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('categories', 'categories', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('site-assets', 'site-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/svg+xml']),
  ('service-images', 'service-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Public Read for all buckets
CREATE POLICY "Public Access artworks"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('artworks', 'categories', 'site-assets', 'service-images'));

-- 2. Authenticated Admin Upload/Update/Delete
CREATE POLICY "Admin Upload artworks"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('artworks', 'categories', 'site-assets', 'service-images')
    AND public.is_admin()
  );

CREATE POLICY "Admin Update artworks"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('artworks', 'categories', 'site-assets', 'service-images')
    AND public.is_admin()
  );

CREATE POLICY "Admin Delete artworks"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('artworks', 'categories', 'site-assets', 'service-images')
    AND public.is_admin()
  );
