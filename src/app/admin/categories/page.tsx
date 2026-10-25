"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  AlertTriangle,
  X,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify, DEFAULT_CATEGORY_SEEDS } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/shared/Toast";
import type { Category } from "@/types/database";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [artworkCount, setArtworkCount] = useState<number>(0);
  const [targetMoveCategoryId, setTargetMoveCategoryId] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const { success, error, info } = useToast();
  const supabase = createClient();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error: catErr } = await supabase
        .from("categories")
        .select("*, artworks(count)")
        .order("sort_order", { ascending: true });

      if (catErr) throw catErr;

      // Map count from relation
      const mapped = (data || []).map((cat: any) => ({
        ...cat,
        artworks_count: cat.artworks?.[0]?.count || 0,
      }));

      setCategories(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load categories";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const seedPresetCategories = async () => {
    try {
      setSeeding(true);
      info("Seeding 12 preset studio categories into database...");

      const { data: existing, error: fetchErr } = await supabase
        .from("categories")
        .select("slug");

      if (fetchErr) throw fetchErr;

      const existingSlugs = new Set((existing || []).map((c) => c.slug));

      const toInsert = DEFAULT_CATEGORY_SEEDS.filter(
        (c) => c.slug && !existingSlugs.has(c.slug)
      ).map((c, i) => ({
        name: c.name,
        slug: c.slug,
        description: `Bespoke, high-end ${c.name} collection engineered for professional creators.`,
        cover_image_url: c.cover_image_url,
        sort_order: c.sort_order || i + 1,
        is_active: true,
      }));

      if (toInsert.length === 0) {
        info("All 12 categories are already populated in your database!");
        return;
      }

      const { error: insertErr } = await supabase.from("categories").insert(toInsert);
      if (insertErr) throw insertErr;

      success(`Successfully added ${toInsert.length} categories to database!`);
      await loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to seed categories";
      error(msg);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setCoverImageUrl(null);
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setCoverImageUrl(cat.cover_image_url || null);
    setSortOrder(cat.sort_order);
    setIsActive(cat.is_active);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      error("Name and slug are required");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        cover_image_url: coverImageUrl,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingCategory) {
        const { error: updateErr } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);

        if (updateErr) throw updateErr;
        success(`Category "${name}" updated successfully`);
      } else {
        const { error: insertErr } = await supabase
          .from("categories")
          .insert(payload);

        if (insertErr) throw insertErr;
        success(`Category "${name}" created successfully`);
      }

      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = async (cat: Category) => {
    setCategoryToDelete(cat);
    setTargetMoveCategoryId("");
    try {
      // Check count of artworks in this category
      const { count, error: countErr } = await supabase
        .from("artworks")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id);

      if (countErr) throw countErr;
      setArtworkCount(count || 0);
      setDeleteModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to check artworks";
      error(msg);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);

      if (artworkCount > 0) {
        if (!targetMoveCategoryId) {
          error("Please choose a category to reassign existing artworks to before deleting");
          setDeleting(false);
          return;
        }

        // Reassign artworks to selected category
        const { error: moveErr } = await supabase
          .from("artworks")
          .update({ category_id: targetMoveCategoryId })
          .eq("category_id", categoryToDelete.id);

        if (moveErr) throw moveErr;
        info(`Reassigned ${artworkCount} artworks`);
      }

      // Now safe to delete category
      const { error: delErr } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (delErr) throw delErr;

      success(`Category "${categoryToDelete.name}" deleted`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      const { error: updateErr } = await supabase
        .from("categories")
        .update({ is_active: !cat.is_active })
        .eq("id", cat.id);

      if (updateErr) throw updateErr;
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
      );
      success(`Category status updated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-purple-400" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create and organize creative categories. Changes appear instantly across the public gallery and filters.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={seedPresetCategories}
            disabled={seeding}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
            title="Import all 12 preset studio categories"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#ff4655]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#ff4655]" />
            )}
            <span>{seeding ? "Importing..." : "Sync 12 Presets"}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-semibold shadow-lg shadow-[#ff4655]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table / Cards */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff4655]" />
            <span className="text-xs">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm flex flex-col items-center gap-4">
            <p className="text-zinc-400">No categories found in database yet.</p>
            <button
              onClick={seedPresetCategories}
              disabled={seeding}
              className="px-4 py-2.5 bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#ff4655]/25"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Import All 12 Default Categories (OC, 3D, VTuber, etc.)</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Cover</th>
                  <th className="px-6 py-4">Name & Slug</th>
                  <th className="px-6 py-4">Artworks</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Cover Image */}
                    <td className="px-6 py-4">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-zinc-800 shrink-0">
                        {cat.cover_image_url ? (
                          <Image
                            src={cat.cover_image_url}
                            alt={cat.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                            No Cover
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name & Slug */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{cat.name}</div>
                      <div className="text-xs font-mono text-purple-400">/{cat.slug}</div>
                      {cat.description && (
                        <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-xs">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    {/* Artwork Count */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-zinc-800/80 px-2.5 py-1 rounded-md text-zinc-300">
                        {cat.artworks_count || 0} pieces
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-zinc-400">{cat.sort_order}</span>
                    </td>

                    {/* Active Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase transition-colors ${
                          cat.is_active
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }`}
                      >
                        {cat.is_active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => promptDelete(cat)}
                          className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 transition-colors"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. 3D Character"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Slug (URL friendly) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="e.g. 3d-character"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short creative summary for category page header"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Cover Image Uploader */}
              <ImageUploader
                bucket="categories"
                folder="covers"
                value={coverImageUrl}
                onChange={(url) => setCoverImageUrl(url)}
                onRemove={() => setCoverImageUrl(null)}
                label="Category Cover Image"
                description="Upload cover image to showcase in category grid"
                aspectRatio="video"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-950 border-zinc-800 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-medium text-zinc-300 cursor-pointer">
                    Visible on Public Site
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Protection Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Delete &quot;{categoryToDelete.name}&quot;?
              </h3>
            </div>

            {artworkCount > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  This category contains <span className="font-bold text-amber-400">{artworkCount}</span>{" "}
                  active artwork{artworkCount > 1 ? "s" : ""}. To prevent orphan database records, you must
                  reassign them before deletion.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-400">
                    Reassign artworks to:
                  </label>
                  <select
                    value={targetMoveCategoryId}
                    onChange={(e) => setTargetMoveCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select target category...</option>
                    {categories
                      .filter((c) => c.id !== categoryToDelete.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                This category is empty. Are you sure you want to permanently delete it?
              </p>
            )}

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
    </div>
  );
}
