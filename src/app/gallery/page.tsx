import React from "react";
import type { Metadata } from "next";
import {
  getSiteSettings,
  getActiveCategories,
  getRecentArtworks,
} from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { GalleryClient } from "@/components/public/GalleryClient";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Artwork } from "@/types/database";

export const metadata: Metadata = {
  title: "Complete Gallery // Creative Art Portfolio",
  description:
    "Explore our complete collection of original characters, 3D models, VTuber avatars, twitch overlays, and digital art.",
  openGraph: {
    title: "Art Gallery // Creative Portfolio",
    description: "Original characters, 3D models, and digital art showcase.",
  },
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
  ]);

  // Fetch all published artworks
  let artworks: Artwork[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("artworks")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) artworks = data as Artwork[];
  } catch (err) {
    console.warn("Failed to load artworks in gallery page:", err);
  }

  // Fallback if database empty
  if (artworks.length === 0) {
    artworks = await getRecentArtworks();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Portfolio Archive</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Curated Artwork Gallery
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore custom characters, stream overlays, fantasy book jackets, and virtual avatars. Filter by category or search by theme.
            </p>
          </div>

          {/* Interactive Client Component */}
          <GalleryClient initialArtworks={artworks} categories={categories} />
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
