"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Crosshair } from "lucide-react";
import type { Category } from "@/types/database";

interface CategoryCardProps {
  category: Category;
  artworkCount?: number;
  index?: number;
}

export function CategoryCard({
  category,
  artworkCount = 0,
  index = 1,
}: CategoryCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

  const formattedIndex = String(index).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/category/${category.slug}`}
        className="group relative block aspect-[4/5] sm:aspect-[16/11] chamfer-card overflow-hidden border border-white/10 hover:border-[#ff4655] transition-all duration-300"
      >
        {/* Cover Image */}
        <Image
          src={category.cover_image_url || fallbackImage}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-[0.75] group-hover:brightness-95"
        />

        {/* Tactical Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />

        {/* Top Header: Index & Count */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-[10px] font-bold">
            <span className="text-[#ff4655]">#{formattedIndex}</span>
            <span>{"//"} {artworkCount} ARTWORKS</span>
          </div>

          <div className="w-8 h-8 chamfer-btn bg-[#ff4655] text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors shadow-md">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Metadata Block */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 space-y-1 bg-gradient-to-t from-black via-black/80 to-transparent">
          <span className="text-[9px] font-mono uppercase text-[#ff4655] tracking-widest block font-bold">
            CLIENT SPEC & ARCHIVE
          </span>
          <h3 className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-tight uppercase group-hover:text-[#ff4655] transition-colors">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed font-sans">
              {category.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
