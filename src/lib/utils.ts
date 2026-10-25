import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SiteSettings, Category } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim — from start of text
    .replace(/-+$/, ""); // Trim — from end of text
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "default",
  site_name: "LUMINA // ART ATELIER",
  site_logo_url: null,
  site_logo_storage_path: null,
  favicon_url: null,
  site_description:
    "Tactical concept art studio specializing in original characters, VTuber Live2D, 3D VRChat avatars, and stream broadcast systems.",
  hero_label: "TACTICAL CONCEPT ART & VIRTUAL AVATARS",
  hero_heading: "REVOLUTIONIZING DIGITAL ART & IDENTITIES",
  hero_description:
    "An elite creative atelier engineering bespoke character turnaround sheets, rigged VTuber models, twitch broadcast packages, and 3D virtual avatars.",
  hero_image_url: "/images/hero-art.jpg",
  primary_cta_text: "EXPLORE ARCHIVE",
  primary_cta_link: "/gallery",
  secondary_cta_text: "INITIATE PROJECT",
  secondary_cta_link: "/contact",
  about_heading: "ENGINEERING IMMERSIVE CHARACTERS & DIGITAL WORLDS",
  about_description:
    "We specialize in transforming conceptual visions into breathtaking digital realities. From bespoke VTuber models to high-impact streaming packages and fantasy book covers, every piece is sculpted with precision and passion.",
  about_image_url: "/images/hero-art.jpg",
  experience_text:
    "Over 7 years designing for international creators, authors, streamers, and game studios.",
  stats_projects: "500+",
  stats_clients: "120+",
  stats_categories: "12",
  contact_email: "commissions@luminastudio.art",
  discord: "lumina_artist#0001",
  phone: "+1 (555) 019-2834",
  whatsapp: null,
  instagram: "https://instagram.com",
  facebook: null,
  twitter: "https://x.com",
  tiktok: null,
  youtube: "https://youtube.com",
  behance: "https://behance.net",
  artstation: "https://artstation.com",
  footer_text:
    "Elevating digital presence with bespoke characters, virtual avatars, and custom stream branding.",
  copyright_text: "© 2026 LUMINA Creative Studio. All rights reserved.",
  primary_color: "#ff4655",
  secondary_color: "#d4ff00",
  updated_at: new Date().toISOString(),
};

export const DEFAULT_CATEGORY_SEEDS: Array<Partial<Category>> = [
  { name: "OC Character", slug: "oc-character", sort_order: 1, cover_image_url: "/images/cat-oc-character.jpg" },
  { name: "Book Cover", slug: "book-cover", sort_order: 2, cover_image_url: "/images/cat-book-cover.jpg" },
  { name: "2D Character", slug: "2d-character", sort_order: 3, cover_image_url: "/images/cat-2d-character.jpg" },
  { name: "3D Character", slug: "3d-character", sort_order: 4, cover_image_url: "/images/cat-3d-character.jpg" },
  { name: "Overlay", slug: "overlay", sort_order: 5, cover_image_url: "/images/cat-overlay.jpg" },
  { name: "Emotes", slug: "emotes", sort_order: 6, cover_image_url: "/images/cat-emotes.jpg" },
  { name: "Thumbnail", slug: "thumbnail", sort_order: 7, cover_image_url: "/images/cat-thumbnail.jpg" },
  { name: "Banner", slug: "banner", sort_order: 8, cover_image_url: "/images/cat-banner.jpg" },
  { name: "Logos", slug: "logos", sort_order: 9, cover_image_url: "/images/cat-logos.jpg" },
  { name: "VTuber", slug: "vtuber", sort_order: 10, cover_image_url: "/images/cat-vtuber.jpg" },
  { name: "Art Scenes", slug: "art-scenes", sort_order: 11, cover_image_url: "/images/cat-art-scenes.jpg" },
  { name: "VRChat Avatars", slug: "vrchat-avatars", sort_order: 12, cover_image_url: "/images/cat-vrchat-avatar.jpg" },
];
