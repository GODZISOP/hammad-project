"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/types/database";

interface ArtworkCardProps {
  artwork: Artwork;
  onOpenLightbox?: () => void;
  priority?: boolean;
}

export function ArtworkCard({
  artwork,
  onOpenLightbox,
  priority = false,
}: ArtworkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group studio-card rounded-xl overflow-hidden flex flex-col"
    >
      {/* High-res Image Preview */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        <Image
          src={artwork.main_image_url}
          alt={artwork.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Featured Tag Indicator */}
        {artwork.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="editorial-badge bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md">
              Featured
            </span>
          </div>
        )}

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-10">
          <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Link
              href={`/artwork/${artwork.slug}`}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              <span>Inspect Full Piece</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {onOpenLightbox && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenLightbox();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-black/70 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700/80 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick Lightbox View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-4 space-y-1.5 bg-zinc-950/70 border-t border-zinc-800/80">
        <div className="flex items-center justify-between gap-2">
          {artwork.category && (
            <Link
              href={`/category/${artwork.category.slug}`}
              className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors truncate"
            >
              {artwork.category.name}
            </Link>
          )}

          {artwork.tags && artwork.tags.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
              #{artwork.tags[0]}
            </span>
          )}
        </div>

        <Link
          href={`/artwork/${artwork.slug}`}
          className="font-bold text-sm text-zinc-100 hover:text-white transition-colors truncate block"
        >
          {artwork.title}
        </Link>
      </div>
    </motion.div>
  );
}
