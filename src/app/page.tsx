import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  FolderTree,
  CheckCircle,
} from "lucide-react";
import {
  getSiteSettings,
  getActiveCategories,
  getFeaturedArtworks,
  getRecentArtworks,
  getActiveServices,
} from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HomeHero } from "@/components/public/HomeHero";
import { CategoryCard } from "@/components/public/CategoryCard";
import { ArtworkCard } from "@/components/public/ArtworkCard";
import { HomeFeatured } from "@/components/public/HomeFeatured";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories, featuredArtworks, allUploadedArtworks, services] =
    await Promise.all([
      getSiteSettings(),
      getActiveCategories(),
      getFeaturedArtworks(),
      getRecentArtworks(),
      getActiveServices(),
    ]);

  const spotlightArtwork = featuredArtworks[0] || allUploadedArtworks[0] || null;

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
      {/* Navbar */}
      <Navbar settings={settings} categories={categories} />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HomeHero settings={settings} featuredArtwork={spotlightArtwork} />

        {/* 2. Featured Works (Admin Choice) */}
        {featuredArtworks.length > 0 && (
          <HomeFeatured artworks={featuredArtworks} />
        )}

        {/* 3. Live Studio Archive: Every Art Uploaded By The Artist */}
        <section className="py-20 border-t border-zinc-900 bg-[#09090d]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div className="space-y-2">
                <span className="editorial-badge text-zinc-400 block">
                  Studio Archive // Live Feed
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Recent Artwork Creations
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  Every piece published from the admin dashboard appears here immediately.
                </p>
              </div>

              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-zinc-300 transition-colors self-start sm:self-auto"
              >
                <span>Browse Full Gallery ({allUploadedArtworks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allUploadedArtworks.map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Disciplines Showcase (Sendable Standalone Links for Clients) */}
        <section className="py-24 border-t border-zinc-900 bg-[#070709]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div className="space-y-2">
                <span className="editorial-badge text-zinc-400 block">
                  Specialized Portfolios // Client Dossiers
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Browse by Discipline
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  Dedicated presentation pages for each creative craft. Send these direct links to prospective clients according to their exact project requirements.
                </p>
              </div>

              <span className="text-xs font-mono text-zinc-500">
                {categories.length} Total Categories
              </span>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  artworkCount={cat.artworks_count || 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Production Services */}
        {services.length > 0 && (
          <section className="py-20 border-t border-zinc-900 bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="space-y-2 max-w-xl">
                <span className="editorial-badge text-zinc-400 block">
                  Studio Deliverables & Commission Specs
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Design Services
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Custom workflows tailored for streamers, authors, game developers, and private collectors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-6 rounded-xl studio-card space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-500">
                        #{svc.sort_order}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {svc.title}
                      </h3>
                      {svc.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {svc.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/contact?service=${encodeURIComponent(svc.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white pt-2"
                    >
                      <span>Inquire about this discipline</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. High-Contrast Commission Call To Action */}
        <section className="py-24 border-t border-zinc-900 bg-[#070709] relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="editorial-badge text-zinc-400 block">
              Commissions Open // Worldwide
            </span>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
              Ready to start your next creative project?
            </h2>

            <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Whether you need character turnarounds, full-body VTuber models, Twitch branding, or 3D VRChat avatars, let&apos;s talk timelines and quotes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs tracking-tight shadow-xl hover:bg-zinc-200 transition-all active:scale-95"
              >
                Send Project Brief
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-3.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-medium text-xs transition-all active:scale-95"
              >
                View Full Archive
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer settings={settings} categories={categories} />
    </div>
  );
}
