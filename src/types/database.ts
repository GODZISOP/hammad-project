export type UserRole = 'admin' | 'editor';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  cover_storage_path?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  artworks_count?: number;
}

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  category_id?: string | null;
  category?: Category | null;
  short_description?: string | null;
  description?: string | null;
  main_image_url: string;
  main_storage_path?: string | null;
  tags: string[];
  external_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
  artwork_images?: ArtworkImage[];
}

export interface ArtworkImage {
  id: string;
  artwork_id: string;
  image_url: string;
  storage_path?: string | null;
  caption?: string | null;
  sort_order: number;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  storage_path?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  discord_username?: string | null;
  project_type?: string | null;
  budget?: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_logo_url?: string | null;
  site_logo_storage_path?: string | null;
  favicon_url?: string | null;
  site_description?: string | null;
  hero_label: string;
  hero_heading: string;
  hero_description: string;
  hero_image_url?: string | null;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  about_heading: string;
  about_description: string;
  about_image_url?: string | null;
  experience_text?: string | null;
  stats_projects: string;
  stats_clients: string;
  stats_categories: string;
  contact_email: string;
  discord?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  behance?: string | null;
  artstation?: string | null;
  footer_text: string;
  copyright_text: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}
