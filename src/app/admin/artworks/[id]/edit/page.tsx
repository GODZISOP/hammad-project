"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MultiImageUploader, type GalleryImageItem } from "@/components/admin/MultiImageUploader";
import { useToast } from "@/components/shared/Toast";
import type { Category, Artwork } from "@/types/database";

export default function EditArtworkPage() {
  const router = useRouter();
  const params = useParams();
  const artworkId = params.id as string;

  const { success, error } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
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
    async function fetchArtworkAndCats() {
      try {
        setLoading(true);

        // Fetch categories
        const { data: catData } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });

        setCategories((catData as Category[]) || []);

        // Fetch artwork with images
        const { data: art, error: artErr } = await supabase
          .from("artworks")
          .select("*, artwork_images(*)")
          .eq("id", artworkId)
          .single();

        if (artErr) throw artErr;

        if (art) {
          setTitle(art.title);
          setSlug(art.slug);
          setCategoryId(art.category_id || "");
          setShortDescription(art.short_description || "");
          setDescription(art.description || "");
          setTagsInput(art.tags ? art.tags.join(", ") : "");
          setMainImageUrl(art.main_image_url);
          setMainStoragePath(art.main_storage_path || null);
          setIsFeatured(art.is_featured);
          setIsPublished(art.is_published);
          setSortOrder(art.sort_order || 0);
          setExternalUrl(art.external_url || "");
          setSeoTitle(art.seo_title || "");
          setSeoDescription(art.seo_description || "");

          if (art.artwork_images && art.artwork_images.length > 0) {
            const sorted = [...art.artwork_images].sort(
              (a, b) => a.sort_order - b.sort_order
            );
            setGalleryImages(sorted);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load artwork";
        error(msg);
      } finally {
        setLoading(false);
      }
    }

    if (artworkId) {
      fetchArtworkAndCats();
    }
  }, [artworkId]);

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

    try {
      setSubmitting(true);

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Validate or resolve category UUID
      let finalCategoryId: string | null = categoryId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (finalCategoryId && !uuidRegex.test(finalCategoryId)) {
        const catSlug = finalCategoryId.replace(/^cat-/, "");
        const { data: foundCat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", catSlug)
          .maybeSingle();

        finalCategoryId = foundCat?.id || null;
      }

      // 1. Update artwork record
      const { error: updateErr } = await supabase
        .from("artworks")
        .update({
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          category_id: finalCategoryId,
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
          seo_description: seoDescription.trim() || null,
        })
        .eq("id", artworkId);

      if (updateErr) throw updateErr;

      // 2. Synchronize gallery images
      // Delete existing artwork_images for this artwork and re-insert current list with clean sort_order
      await supabase.from("artwork_images").delete().eq("artwork_id", artworkId);

      if (galleryImages.length > 0) {
        const imagesPayload = galleryImages.map((g, idx) => ({
          artwork_id: artworkId,
          image_url: g.image_url,
          storage_path: g.storage_path || null,
          caption: g.caption || null,
          sort_order: idx + 1,
        }));

        const { error: insErr } = await supabase
          .from("artwork_images")
          .insert(imagesPayload);

        if (insErr) {
          console.warn("Gallery sync warning:", insErr);
        }
      }

      success(`Artwork "${title}" updated successfully!`);
      router.push("/admin/artworks");
      router.refresh();
    } catch (err: unknown) {
      console.error("Update artwork error:", err);
      const postgrestErr = err as { message?: string; details?: string; hint?: string };
      const msg =
        postgrestErr?.message ||
        (err instanceof Error ? err.message : "Failed to update artwork");
      error(postgrestErr?.details ? `${msg} (${postgrestErr.details})` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="text-sm">Loading artwork details...</span>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-white tracking-tight">Edit Artwork</h1>
            <p className="text-xs text-zinc-400">Update content, manage gallery angles, or tweak SEO</p>
          </div>
        </div>

        <Link
          href={`/artwork/${slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <span>View Public Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
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
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Category...</option>
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Short Summary</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-y"
            />
          </div>
        </div>

        {/* Media Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
            Media & Images
          </h2>

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
            description="Replace cover image in Supabase storage"
            aspectRatio="portrait"
          />

          <hr className="border-zinc-800/80" />

          <MultiImageUploader
            images={galleryImages}
            onChange={(imgs) => setGalleryImages(imgs)}
            label="Additional Gallery & Detail Shots"
          />
        </div>

        {/* Visibility */}
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
                Published
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
            <label className="block text-xs font-medium text-zinc-300">External Link</label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
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
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">SEO Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
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
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
