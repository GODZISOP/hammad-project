"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/shared/Toast";
import type { ServiceItem } from "@/types/database";

const AVAILABLE_ICONS = [
  "Sparkles",
  "UserCheck",
  "Video",
  "Glasses",
  "Layout",
  "BookOpen",
  "Smile",
  "Palette",
  "Layers",
  "Zap",
  "Shield",
  "Star",
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error } = useToast();
  const supabase = createClient();

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (err) throw err;
      setServices((data as ServiceItem[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load services";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setIcon("Sparkles");
    setImageUrl(null);
    setSortOrder(services.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    setTitle(svc.title);
    setSlug(svc.slug);
    setDescription(svc.description || "");
    setIcon(svc.icon || "Sparkles");
    setImageUrl(svc.image_url || null);
    setSortOrder(svc.sort_order);
    setIsActive(svc.is_active);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingService) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      error("Title and slug are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        icon,
        image_url: imageUrl,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingService) {
        const { error: updateErr } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id);

        if (updateErr) throw updateErr;
        success(`Service "${title}" updated`);
      } else {
        const { error: insertErr } = await supabase
          .from("services")
          .insert(payload);

        if (insertErr) throw insertErr;
        success(`Service "${title}" created`);
      }

      setModalOpen(false);
      loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save service";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setDeleting(true);
      const { error: delErr } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete.id);

      if (delErr) throw delErr;
      success(`Service deleted`);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (svc: ServiceItem) => {
    try {
      const { error: err } = await supabase
        .from("services")
        .update({ is_active: !svc.is_active })
        .eq("id", svc.id);

      if (err) throw err;
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, is_active: !s.is_active } : s))
      );
      success("Service visibility updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-purple-400" />
            <span>Creative Services</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Offerings, commissions, and visual packages displayed on the website.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs">Loading services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full p-16 text-center text-zinc-500 text-sm">
            No services configured yet.
          </div>
        ) : (
          services.map((svc) => (
            <div
              key={svc.id}
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <button
                    onClick={() => toggleActive(svc)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase transition-colors ${
                      svc.is_active
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}
                  >
                    {svc.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{svc.is_active ? "Active" : "Hidden"}</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-base">{svc.title}</h3>
                  <div className="text-xs font-mono text-zinc-500">/{svc.slug}</div>
                </div>

                {svc.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <span className="text-[11px] font-mono text-zinc-500">
                  Order: #{svc.sort_order}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(svc)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setServiceToDelete(svc);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add/Edit Service */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">
                {editingService ? "Edit Service" : "Add Service"}
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
                <label className="block text-xs font-medium text-zinc-300">Service Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. VTuber Models & Rigging"
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
                  placeholder="e.g. vtuber-models"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deliverables, turnaround time, package breakdown..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Icon Keyword</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUploader
                bucket="service-images"
                folder="services"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl(null)}
                label="Service Preview Image (Optional)"
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
                    id="svcActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-950 border-zinc-800"
                  />
                  <label htmlFor="svcActive" className="text-xs font-medium text-zinc-300 cursor-pointer">
                    Active & Visible
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
                  <span>{editingService ? "Save Changes" : "Create Service"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Delete &quot;{serviceToDelete.title}&quot;?
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete this service?
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
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
