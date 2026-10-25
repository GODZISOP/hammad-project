import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lumina-studio.art";

  // Base routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const supabase = await createClient();

    // 1. Dynamic Categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 2. Dynamic Artworks
    const { data: artworks } = await supabase
      .from("artworks")
      .select("slug, updated_at")
      .eq("is_published", true);

    const artworkRoutes: MetadataRoute.Sitemap = (artworks || []).map((art) => ({
      url: `${baseUrl}/artwork/${art.slug}`,
      lastModified: new Date(art.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...artworkRoutes];
  } catch (err) {
    console.warn("Failed to generate dynamic sitemap, returning static routes:", err);
    return staticRoutes;
  }
}
