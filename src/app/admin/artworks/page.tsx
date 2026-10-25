"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Maximize2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";
import { Lightbox } from "@/components/shared/Lightbox";
import type { Artwork, Category } from "@/types/database";

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [artToDelete, setArtToDelete] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lightbox preview
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { success, error } = useToast();
  const supabase = createClient();

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const { data: artData, error: artErr } = await supabase
        .from("artworks")
        .select("*, category:categories(*), artwork_images(*)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (artErr) throw artErr;
      setArtworks((artData as Artwork[]) || []);

      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      setCategories((catData as Category[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load artworks";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  // Filtered artworks
  const filtered = useMemo(() => {
    return artworks.filter((art) => {
      // Category filter
      if (selectedCategory !== "all" && art.category_id !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "published" && !art.is_published) return false;
      if (statusFilter === "draft" && art.is_published) return false;
      if (statusFilter === "featured" && !art.is_featured) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = art.title.toLowerCase().includes(q);
        const catMatch = art.category?.name.toLowerCase().includes(q);
        const tagMatch = art.tags?.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !catMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [artworks, selectedCategory, statusFilter, searchQuery]);

  const toggleFeatured = async (art: Artwork) => {
    try {
      const { error: err } = await supabase
        .from("artworks")
        .update({ is_featured: !art.is_featured })
        .eq("id", art.id);

      if (err) throw err;

      setArtworks((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, is_featured: !a.is_featured } : a))
      );
      success(`Updated featured status for "${art.title}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      error(msg);
    }
  };

  const togglePublished = async (art: Artwork) => {
    try {
      const { error: err } = await supabase
        .from("artworks")
        .update({ is_published: !art.is_published })
        .eq("id", art.id);

      if (err) throw err;

      setArtworks((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, is_published: !a.is_published } : a))
      );
      success(`Updated visibility for "${art.title}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      error(msg);
    }
  };

  const confirmDelete = async () => {
    if (!artToDelete) return;
    try {
      setDeleting(true);
      const { error: err } = await supabase
        .from("artworks")
        .delete()
        .eq("id", artToDelete.id);

      if (err) throw err;

      success(`Artwork "${artToDelete.title}" deleted`);
      setDeleteModalOpen(false);
      setArtToDelete(null);
      loadArtworks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const previewLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-purple-400" />
            <span>Artwork Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Publish portfolio pieces, assign categories, manage gallery multi-views, and toggle featured status.
          </p>
        </div>

        <Link
          href="/admin/artworks/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Artwork</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Artworks List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs">Loading artworks...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm space-y-2">
            <p>No artworks match your search or filter criteria.</p>
            <Link
              href="/admin/artworks/new"
              className="inline-block text-xs text-purple-400 hover:underline font-medium"
            >
              + Create a new artwork
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((art, idx) => (
                  <tr key={art.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Thumbnail with Lightbox trigger */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => previewLightbox(idx)}
                        className="group/img relative w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-zinc-800 shrink-0 cursor-pointer shadow-md"
                      >
                        <Image
                          src={art.main_image_url}
                          alt={art.title}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Tags */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{art.title}</div>
                      <div className="text-xs font-mono text-zinc-500">/{art.slug}</div>
                      {art.tags && art.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {art.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                          {art.tags.length > 3 && (
                            <span className="text-[10px] text-zinc-500">
                              +{art.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-500/20 px-2.5 py-1 rounded-md">
                        {art.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(art)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          art.is_featured
                            ? "bg-amber-950/60 text-amber-400 border-amber-500/30"
                            : "bg-zinc-800 text-zinc-600 border-zinc-700 hover:text-zinc-400"
                        }`}
                        title={art.is_featured ? "Featured on homepage" : "Not featured"}
                      >
                        <Star
                          className={`w-4 h-4 ${art.is_featured ? "fill-amber-400" : ""}`}
                        />
                      </button>
                    </td>

                    {/* Status toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublished(art)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase transition-colors ${
                          art.is_published
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }`}
                      >
                        {art.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      {formatDate(art.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/artwork/${art.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="View public detail page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/artworks/${art.id}/edit`}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-400 hover:text-purple-300 transition-colors"
                          title="Edit artwork"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setArtToDelete(art);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 transition-colors"
                          title="Delete artwork"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && artToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Delete &quot;{artToDelete.title}&quot;?
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete this artwork? All associated gallery images will also be removed. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for preview */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={filtered.map((a) => ({
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
