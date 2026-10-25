"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Crosshair, Star } from "lucide-react";
import { ArtworkCard } from "./ArtworkCard";
import { Lightbox } from "@/components/shared/Lightbox";
import type { Artwork } from "@/types/database";

interface HomeFeaturedProps {
  artworks: Artwork[];
}

export function HomeFeatured({ artworks }: HomeFeaturedProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (artworks.length === 0) return null;

  return (
    <section className="py-20 relative bg-[#090a0f] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#ff4655]">
              <Crosshair className="w-3.5 h-3.5 text-[#ff4655]" />
              <span>PRIMARY SELECTION // HIGHLIGHT OF WEEK</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-mono font-extrabold text-white tracking-tighter uppercase">
              FEATURED MASTERPIECES
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-mono">
              Curated showcase chosen by the studio. High-impact character sheets, virtual avatars, and custom stream HUDs.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 chamfer-btn bg-[#161824] hover:bg-[#ff4655] text-zinc-200 hover:text-white font-mono text-xs font-bold border border-white/10 transition-colors self-start sm:self-auto"
          >
            <span>VIEW ALL ARTWORKS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Artworks Grid (Maximum 6 Featured, 3x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.slice(0, 6).map((art, idx) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              onOpenLightbox={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={artworks.map((a) => ({
          url: a.main_image_url,
          title: a.title,
          caption: `${a.category?.name || "Featured Art"} - ${a.short_description || ""}`,
        }))}
        currentIndex={lightboxIndex}
        onIndexChange={(idx) => setLightboxIndex(idx)}
      />
    </section>
  );
}
