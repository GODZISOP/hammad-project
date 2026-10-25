"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Crosshair, RefreshCw, X } from "lucide-react";
import { ArtworkCard } from "./ArtworkCard";
import { Lightbox } from "@/components/shared/Lightbox";
import type { Artwork, Category } from "@/types/database";

interface GalleryClientProps {
  initialArtworks: Artwork[];
  categories: Category[];
}

const PAGE_SIZE = 12;

export function GalleryClient({
  initialArtworks,
  categories,
}: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter artworks
  const filtered = useMemo(() => {
    return initialArtworks.filter((art) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (art.category?.slug !== selectedCategory && art.category_id !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = art.title.toLowerCase().includes(q);
        const catMatch = art.category?.name.toLowerCase().includes(q);
        const descMatch = (art.description || "").toLowerCase().includes(q);
        const shortMatch = (art.short_description || "").toLowerCase().includes(q);
        const tagMatch = art.tags?.some((t) => t.toLowerCase().includes(q));

        if (!titleMatch && !catMatch && !descMatch && !shortMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialArtworks, selectedCategory, searchQuery]);

  const visibleArtworks = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-8">
      {/* Tactical Search & Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-zinc-500 font-mono text-xs">
            <Crosshair className="w-4 h-4 text-[#ff4655]" />
            <span className="text-[#ff4655] font-bold">QUERY //</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, tag, category, or style..."
            className="w-full pl-28 pr-12 py-3.5 bg-[#10121a] border border-white/10 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#ff4655] shadow-2xl transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tactical Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none justify-start md:justify-center">
          <button
            onClick={() => handleCategorySelect("all")}
            className={`px-4 py-2 chamfer-btn text-xs font-mono font-bold tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/30 scale-105"
                : "bg-[#10121a] text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            [ALL WORKS ({initialArtworks.length})]
          </button>

          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-4 py-2 chamfer-btn text-xs font-mono font-bold tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? "bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/30 scale-105"
                  : "bg-[#10121a] text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-white/10 pb-3">
        <div>
          <span>LOGGED ENTRIES:</span>{" "}
          <span className="text-white font-bold">{visibleArtworks.length}</span> /{" "}
          <span className="text-zinc-400">{filtered.length} TOTAL</span>
        </div>
        {selectedCategory !== "all" && (
          <button
            onClick={() => handleCategorySelect("all")}
            className="text-[#ff4655] hover:underline"
          >
            RESET DISCIPLINE FILTER [X]
          </button>
        )}
      </div>

      {/* Artworks Grid */}
      {visibleArtworks.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 rounded-xl bg-[#10121a] border border-white/10 space-y-3">
          <Crosshair className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-mono font-bold text-zinc-300">NO ARTWORKS DETECTED</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
            Adjust your search query or reset category filter to inspect all published archive pieces.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleArtworks.map((art, idx) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              onOpenLightbox={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              priority={idx < 4}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-8 py-3.5 chamfer-btn bg-[#161824] hover:bg-[#ff4655] text-zinc-200 hover:text-white font-mono font-bold text-xs tracking-widest border border-white/10 shadow-xl transition-all"
          >
            <RefreshCw className="w-4 h-4 text-[#ff4655]" />
            <span>LOAD MORE WORKS [{filtered.length - visibleCount} REMAINING]</span>
          </button>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={visibleArtworks.map((a) => ({
          url: a.main_image_url,
          title: a.title,
          caption: `${a.category?.name || "Art"} - ${a.short_description || ""}`,
        }))}
        currentIndex={lightboxIndex}
        onIndexChange={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}
