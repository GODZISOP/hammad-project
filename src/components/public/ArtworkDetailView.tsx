"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Maximize2,
  FolderTree,
  Tag,
  Share2,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Lightbox } from "@/components/shared/Lightbox";
import { ArtworkCard } from "./ArtworkCard";
import type { Artwork } from "@/types/database";

interface ArtworkDetailViewProps {
  artwork: Artwork;
  relatedArtworks: Artwork[];
}

export function ArtworkDetailView({
  artwork,
  relatedArtworks,
}: ArtworkDetailViewProps) {
  // Consolidate all images (main + gallery images)
  const allImages = [
    {
      url: artwork.main_image_url,
      title: artwork.title,
      caption: artwork.short_description || "Primary Cover View",
    },
    ...(artwork.artwork_images || []).map((img) => ({
      url: img.image_url,
      title: artwork.title,
      caption: img.caption || "Detail Shot",
    })),
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedImage = allImages[activeImageIndex] || allImages[0];

  return (
    <div className="space-y-16">
      {/* Top Main Artwork Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Interactive Media Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onClick={() => setLightboxOpen(true)}
            className="group relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl cursor-pointer"
          >
            <Image
              src={selectedImage.url}
              alt={artwork.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Click to Enlarge Badge */}
            <div className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Maximize2 className="w-4 h-4" />
            </div>

            {selectedImage.caption && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs text-zinc-300 text-center">
                {selectedImage.caption}
              </div>
            )}
          </div>

          {/* Multiple Angle Thumbnails */}
          {allImages.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 block">
                Gallery Views ({allImages.length})
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeImageIndex
                        ? "border-purple-500 scale-105 shadow-lg shadow-purple-500/20"
                        : "border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Angle ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Artwork Metadata & Inquiries (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            {artwork.category && (
              <Link
                href={`/category/${artwork.category.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium hover:bg-purple-900/60 transition-colors"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>{artwork.category.name}</span>
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {artwork.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formatDate(artwork.created_at)}</span>
              </span>
              {artwork.external_url && (
                <a
                  href={artwork.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>External Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Short Description */}
          {artwork.short_description && (
            <p className="text-base text-zinc-300 leading-relaxed font-medium">
              {artwork.short_description}
            </p>
          )}

          {/* Full Creative Story Description */}
          {artwork.description && (
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 block font-semibold">
                Project Notes & Concept
              </span>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 block">Keywords & Disciplines</span>
              <div className="flex flex-wrap gap-1.5">
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commission Call To Action Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Want something similar?</h3>
              <p className="text-xs text-zinc-400">
                Book a custom character, stream overlay suite, or 3D model project directly with the studio.
              </p>
            </div>

            <Link
              href={`/contact?project=${encodeURIComponent(artwork.title)}&type=${encodeURIComponent(
                artwork.category?.name || ""
              )}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Related Artworks */}
      {relatedArtworks.length > 0 && (
        <div className="pt-12 border-t border-zinc-900 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              More from {artwork.category?.name || "this collection"}
            </h2>
            {artwork.category && (
              <Link
                href={`/category/${artwork.category.slug}`}
                className="text-xs text-purple-400 hover:underline font-medium"
              >
                View all in {artwork.category.name}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArtworks.map((rel) => (
              <ArtworkCard key={rel.id} artwork={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allImages}
        currentIndex={activeImageIndex}
        onIndexChange={(idx) => setActiveImageIndex(idx)}
      />
    </div>
  );
}
