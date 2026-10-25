import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check, Share2, Sparkles } from "lucide-react";
import {
  getSiteSettings,
  getActiveCategories,
  getCategoryBySlug,
  getArtworksByCategory,
} from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ArtworkCard } from "@/components/public/ArtworkCard";
import { CategoryShareButton } from "@/components/public/CategoryShareButton";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} Portfolio // Client Showcase`,
    description:
      category.description ||
      `Explore curated ${category.name} portfolio works, concept art, and commissioned pieces.`,
    openGraph: {
      title: `${category.name} // Portfolio Collection`,
      description: category.description || undefined,
      images: category.cover_image_url ? [category.cover_image_url] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [settings, categories, category] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getCategoryBySlug(slug),
  ]);

  if (!category) {
    notFound();
  }

  const artworks = await getArtworksByCategory(category.id, category.slug);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
      <Navbar settings={settings} categories={categories} />

      <main className="flex-1 pt-28 pb-24">
        {/* Client Presentation Dossier Header */}
        <section className="relative border-b border-zinc-900 bg-[#09090d] py-16 overflow-hidden">
          {category.cover_image_url && (
            <div className="absolute inset-0 z-0 opacity-15">
              <Image
                src={category.cover_image_url}
                alt={category.name}
                fill
                priority
                className="object-cover blur-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/80 via-[#070709]/95 to-[#070709]" />
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all disciplines</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
              <div className="space-y-3">
                <span className="editorial-badge text-zinc-400 block">
                  Discipline Dossier // Shareable Client Link
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Client Action Group: Share link & Commission */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <CategoryShareButton categoryName={category.name} />

                <Link
                  href={`/contact?type=${encodeURIComponent(category.name)}`}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs tracking-tight transition-all active:scale-95 shadow-lg"
                >
                  Commission {category.name}
                </Link>
              </div>
            </div>

            {/* Spec Ledger */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400 pt-1">
              <div>
                <span className="text-zinc-500">Archive Count:</span>{" "}
                <span className="text-white font-bold">{artworks.length} pieces</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <div>
                <span className="text-zinc-500">Availability:</span>{" "}
                <span className="text-emerald-400 font-semibold">Open for Commissions</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <div>
                <span className="text-zinc-500">Deliverables:</span>{" "}
                <span className="text-zinc-200">High-Res PNG, PSD, Source Files</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Artworks Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
          {artworks.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
              <h3 className="text-base font-semibold text-zinc-300">
                No artworks published in &quot;{category.name}&quot; yet.
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Upload pieces under this category in the Admin Dashboard to display them to prospective clients here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artworks.map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
            </div>
          )}

          {/* Other Categories Switcher */}
          <div className="pt-16 border-t border-zinc-900 space-y-6">
            <span className="editorial-badge text-zinc-500 block">
              Explore Alternative Disciplines
            </span>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== category.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
