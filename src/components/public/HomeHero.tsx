"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Crosshair, Sparkles, Terminal, Shield } from "lucide-react";
import type { SiteSettings, Artwork } from "@/types/database";

interface HomeHeroProps {
  settings: SiteSettings;
  featuredArtwork?: Artwork | null;
}

export function HomeHero({ settings, featuredArtwork }: HomeHeroProps) {
  const heroImage =
    settings.hero_image_url ||
    featuredArtwork?.main_image_url ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80";

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between pt-32 pb-12 overflow-hidden tactical-grid border-b border-white/10 bg-[#090a0f]">
      {/* Top Tactical Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-ping" />
          <span className="text-[#ff4655] font-bold">STATUS: RECEPTIVE // COMMISSIONS LIVE</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span>PIPELINE: BLENDER • ZBRUSH • PHOTOSHOP • LIVE2D • UNITY</span>
          <span>SYS_VER // 2026.4</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Tactical Copy (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Meta Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#161824] border border-white/10 text-xs font-mono text-zinc-300">
              <Crosshair className="w-3.5 h-3.5 text-[#ff4655]" />
              <span className="text-[#ff4655] font-bold font-mono">SECTOR_01 //</span>
              <span className="tracking-wider">{settings.hero_label || "CONCEPT ART & VIRTUAL AVATARS"}</span>
            </div>

            {/* Main Title with Valorant / High-Tech Streetwear Impact */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter uppercase leading-[1.05] font-mono">
              REVOLUTIONIZING <br />
              <span className="text-[#ff4655] underline decoration-[#ff4655]/40 decoration-4">DIGITAL ART</span> & IDENTITIES
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-normal leading-relaxed">
              {settings.hero_description ||
                "A curated archive of high-caliber characters, VTuber models, Twitch broadcast suites, and 3D virtual avatars engineered for distinction."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={settings.primary_cta_link || "/gallery"}
                className="inline-flex items-center gap-3 px-8 py-4 chamfer-btn bg-[#ff4655] hover:bg-[#ff5a68] text-white font-mono font-extrabold text-xs tracking-widest shadow-xl shadow-[#ff4655]/25"
              >
                <span>EXPLORE ARCHIVE</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href={settings.secondary_cta_link || "/contact"}
                className="inline-flex items-center gap-2 px-7 py-4 chamfer-btn bg-[#12141c] hover:bg-[#1a1d29] text-zinc-200 hover:text-white font-mono text-xs font-bold border border-white/10 tracking-wider"
              >
                <span>COMMISSION WORK</span>
              </Link>
            </div>

            {/* Supported By / Pipeline Logos Bar (from Reference 1) */}
            <div className="pt-8 border-t border-white/10 space-y-3">
              <span className="tactical-mono text-[10px] text-zinc-500 font-bold block">
                PRODUCTION ECOSYSTEM & SOFTWARE CAPABILITIES
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {["BLENDER 3D", "ZBRUSH", "CLIP STUDIO", "PHOTOSHOP", "LIVE2D CUBISM", "UNITY 3D"].map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded bg-[#10121a] border border-white/10 text-[10px] font-mono font-semibold text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Spotlight: Framed Character Showcase (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative chamfer-card p-2.5 bg-[#12141e] border-2 border-[#ff4655]/40 shadow-2xl">
              {/* Tactical Corner Crosshairs */}
              <div className="absolute top-2 left-2 z-20 text-[9px] font-mono text-[#ff4655] font-bold bg-black/80 px-2 py-0.5 border border-[#ff4655]/30">
                // TARGET_LOCK: {featuredArtwork?.category?.name || "SIGNATURE"}
              </div>

              <div className="relative aspect-[4/5] rounded overflow-hidden bg-black">
                <Image
                  src={heroImage}
                  alt={featuredArtwork?.title || "Hero Piece"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#ff4655] font-bold tracking-widest block">
                      {featuredArtwork?.category?.name || "ARCHIVE SELECTION"}
                    </span>
                    <h3 className="text-base font-mono font-extrabold text-white tracking-tight">
                      {featuredArtwork?.title || "CYBERPUNK VALKYRIE 01"}
                    </h3>
                  </div>

                  <Link
                    href={
                      featuredArtwork
                        ? `/artwork/${featuredArtwork.slug}`
                        : "/gallery"
                    }
                    className="p-2.5 chamfer-btn bg-[#ff4655] text-white hover:bg-white hover:text-black transition-colors"
                    title="Inspect Art"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metrics Banner (from Reference 1: "1M Users, 50M Impressions, 500K Happy Clients") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="border-l-2 border-[#ff4655] pl-4">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white block">
              {settings.stats_projects || "500+"}
            </span>
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider block">
              COMPLETED ARTWORKS
            </span>
          </div>

          <div className="border-l-2 border-white/20 pl-4">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white block">
              {settings.stats_clients || "120+"}
            </span>
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider block">
              COMMISSION CLIENTS
            </span>
          </div>

          <div className="border-l-2 border-white/20 pl-4">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white block">
              {settings.stats_categories || "12"}
            </span>
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider block">
              CREATIVE CATEGORIES
            </span>
          </div>

          <div className="border-l-2 border-emerald-500 pl-4">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 block">
              100%
            </span>
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider block">
              CLIENT SATISFACTION
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
