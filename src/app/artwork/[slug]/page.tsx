import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getSiteSettings,
  getActiveCategories,
  getArtworkBySlug,
  getRelatedArtworks,
} from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ArtworkDetailView } from "@/components/public/ArtworkDetailView";

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return {
      title: "Artwork Not Found",
    };
  }

  const title = artwork.seo_title || `${artwork.title} // Portfolio Showcase`;
  const description =
    artwork.seo_description ||
    artwork.short_description ||
    artwork.description ||
    `View ${artwork.title} creative artwork.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: artwork.main_image_url,
          width: 1200,
          height: 630,
          alt: artwork.title,
        },
      ],
    },
  };
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const [settings, categories, artwork] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getArtworkBySlug(slug),
  ]);

  if (!artwork) {
    notFound();
  }

  const relatedArtworks = artwork.category_id
    ? await getRelatedArtworks(artwork.category_id, artwork.id)
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to portfolio gallery</span>
          </Link>

          <ArtworkDetailView
            artwork={artwork}
            relatedArtworks={relatedArtworks}
          />
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
