"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Plus, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify, DEFAULT_CATEGORY_SEEDS } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MultiImageUploader, type GalleryImageItem } from "@/components/admin/MultiImageUploader";
import { useToast } from "@/components/shared/Toast";
import type { Category } from "@/types/database";

export default function NewArtworkPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [mainStoragePath, setMainStoragePath] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    async function fetchCats() {
      try {
        const { data, error: catErr } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });

        if (catErr) throw catErr;
        let cats = (data as Category[]) || [];
        if (cats.length === 0) {
          cats = DEFAULT_CATEGORY_SEEDS.map((c, i) => ({
            id: `cat-${c.slug}`,
            name: c.name || "",
            slug: c.slug || "",
            description: null,
            cover_image_url: c.cover_image_url || null,
            cover_image_storage_path: null,
            sort_order: c.sort_order || i + 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
        }
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err: unknown) {
        console.warn("Failed to load categories, using defaults:", err);
        const fallbackCats = DEFAULT_CATEGORY_SEEDS.map((c, i) => ({
          id: `cat-${c.slug}`,
          name: c.name || "",
          slug: c.slug || "",
          description: null,
          cover_image_url: c.cover_image_url || null,
          cover_image_storage_path: null,
          sort_order: c.sort_order || i + 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setCategories(fallbackCats);
        if (fallbackCats.length > 0) {
          setCategoryId(fallbackCats[0].id);
        }
      } finally {
        setLoadingCats(false);
      }
    }

    fetchCats();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
    if (!seoTitle) {
      setSeoTitle(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error("Artwork title is required");
      return;
    }

    if (!mainImageUrl) {
      error("Main artwork image is required");
      return;
    }

    if (!categoryId) {
      error("Please select a category");
      return;
    }

    try {
      setSubmitting(true);

      // Parse tags
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // 1. Insert artwork record
      const { data: insertedArt, error: artErr } = await supabase
        .from("artworks")
        .insert({
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          category_id: categoryId,
          short_description: shortDescription.trim() || null,
          description: description.trim() || null,
          main_image_url: mainImageUrl,
          main_storage_path: mainStoragePath,
          tags: tagsArray,
          external_url: externalUrl.trim() || null,
          is_featured: isFeatured,
          is_published: isPublished,
          sort_order: Number(sortOrder) || 0,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || shortDescription.trim() || null,
        })
        .select()
        .single();

      if (artErr) throw artErr;

      // 2. Insert additional gallery images if any
      if (galleryImages.length > 0 && insertedArt) {
        const imagesPayload = galleryImages.map((g, idx) => ({
          artwork_id: insertedArt.id,
          image_url: g.image_url,
          storage_path: g.storage_path || null,
          caption: g.caption || null,
          sort_order: idx + 1,
        }));

        const { error: imgErr } = await supabase
          .from("artwork_images")
          .insert(imagesPayload);

        if (imgErr) {
          console.warn("Artwork images insert warning:", imgErr);
        }
      }

      success(`Artwork "${title}" published successfully!`);
      router.push("/admin/artworks");
      router.refresh();
    } catch (err: unknown) {
      console.error("Create artwork error:", err);
      const postgrestErr = err as { message?: string; details?: string; hint?: string };
      const msg =
        postgrestErr?.message ||
        (err instanceof Error ? err.message : "Failed to create artwork");
      error(postgrestErr?.details ? `${msg} (${postgrestErr.details})` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/artworks"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Upload New Artwork</h1>
            <p className="text-xs text-zinc-400">Fill in details and upload high-res images</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Artwork Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Aetheria: Celestial Sorceress"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. aetheria-celestial-sorceress"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCats}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Character, Fantasy, Digital Painting, 3D"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Short Summary</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-sentence hook displayed in cards and previews"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the creative story behind this piece, software tools used (Blender, Photoshop, Live2D), and project background..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-y"
            />
          </div>
        </div>

        {/* Media Card: Cover & Gallery */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
            Media & Images
          </h2>

          {/* Main Cover Image */}
          <ImageUploader
            bucket="artworks"
            folder="covers"
            value={mainImageUrl}
            onChange={(url, path) => {
              setMainImageUrl(url);
              setMainStoragePath(path || null);
            }}
            onRemove={() => {
              setMainImageUrl(null);
              setMainStoragePath(null);
            }}
            label="Primary Cover Image *"
            description="High-resolution image shown in gallery cards and hero view"
            aspectRatio="portrait"
          />

          <hr className="border-zinc-800/80" />

          {/* Additional Gallery Multi-Images */}
          <MultiImageUploader
            images={galleryImages}
            onChange={(imgs) => setGalleryImages(imgs)}
            label="Additional Gallery & Detail Shots"
          />
        </div>

        {/* Visibility & Organization */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
            Visibility & Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-zinc-900 border-zinc-700"
              />
              <label htmlFor="isFeatured" className="text-xs font-medium text-zinc-200 cursor-pointer">
                Feature on Homepage
              </label>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-zinc-900 border-zinc-700"
              />
              <label htmlFor="isPublished" className="text-xs font-medium text-zinc-200 cursor-pointer">
                Publish Immediately
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-400">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              External Link (ArtStation, Behance, YouTube speedpaint)
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://artstation.com/artwork/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* SEO Meta */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
            SEO & Social Meta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Custom SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Artwork Title // Character Design"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">SEO Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Search engine snippet text"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Link
            href="/admin/artworks"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Publish Artwork</span>
          </button>
        </div>
      </form>
    </div>
  );
}
