"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Sparkles,
  Globe,
  Share2,
  Info,
  Phone,
  Palette,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/shared/Toast";
import { DEFAULT_SETTINGS } from "@/lib/utils";
import type { SiteSettings } from "@/types/database";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "hero" | "about" | "contact" | "social" | "theme">("general");

  const { success, error } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .single();

        if (err && err.code !== "PGRST116") {
          console.warn("Settings fetch note:", err);
        }

        if (data) {
          setSettings(data as SiteSettings);
        }
      } catch (err) {
        console.error("Load settings error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Check if existing row exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1);

      if (existing && existing.length > 0) {
        const { error: updateErr } = await supabase
          .from("site_settings")
          .update(settings)
          .eq("id", existing[0].id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("site_settings")
          .insert(settings);

        if (insertErr) throw insertErr;
      }

      success("Website settings updated successfully! Live site reflects changes.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="text-sm">Loading studio settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General & Branding", icon: Globe },
    { id: "hero", label: "Hero Banner", icon: Sparkles },
    { id: "about", label: "About & Stats", icon: Info },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "social", label: "Social Networks", icon: Share2 },
    { id: "theme", label: "Theme Accents", icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-purple-400" />
            <span>Website Settings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global controls for hero copy, brand logos, studio biography, social handles, and commission details.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. General & Branding */}
        {activeTab === "general" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              General Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Site Title / Name</label>
                <input
                  type="text"
                  value={settings.site_name || ""}
                  onChange={(e) => handleChange("site_name", e.target.value)}
                  placeholder="LUMINA // Digital Art Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Meta Site Description</label>
                <input
                  type="text"
                  value={settings.site_description || ""}
                  onChange={(e) => handleChange("site_description", e.target.value)}
                  placeholder="High-end creative portfolio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <ImageUploader
                bucket="site-assets"
                folder="branding"
                value={settings.site_logo_url}
                onChange={(url, path) => {
                  handleChange("site_logo_url", url);
                  handleChange("site_logo_storage_path", path);
                }}
                onRemove={() => {
                  handleChange("site_logo_url", null);
                  handleChange("site_logo_storage_path", null);
                }}
                label="Site Logo (Light on Dark)"
                description="Transparent PNG or SVG recommended"
                aspectRatio="video"
              />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Footer Text</label>
                  <textarea
                    rows={3}
                    value={settings.footer_text || ""}
                    onChange={(e) => handleChange("footer_text", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Copyright Line</label>
                  <input
                    type="text"
                    value={settings.copyright_text || ""}
                    onChange={(e) => handleChange("copyright_text", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Hero Banner */}
        {activeTab === "hero" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              Hero Section Customization
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Small Badge Label</label>
                <input
                  type="text"
                  value={settings.hero_label || ""}
                  onChange={(e) => handleChange("hero_label", e.target.value)}
                  placeholder="DIGITAL ART & CREATIVE DESIGN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Main Hero Heading *</label>
                <input
                  type="text"
                  required
                  value={settings.hero_heading || ""}
                  onChange={(e) => handleChange("hero_heading", e.target.value)}
                  placeholder="Creative Art That Brings Ideas To Life"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Hero Description *</label>
                <textarea
                  rows={3}
                  required
                  value={settings.hero_description || ""}
                  onChange={(e) => handleChange("hero_description", e.target.value)}
                  placeholder="A curated collection of characters, artwork, overlays, avatars..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Primary CTA Text</label>
                  <input
                    type="text"
                    value={settings.primary_cta_text || ""}
                    onChange={(e) => handleChange("primary_cta_text", e.target.value)}
                    placeholder="Explore Portfolio"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Primary CTA Link</label>
                  <input
                    type="text"
                    value={settings.primary_cta_link || ""}
                    onChange={(e) => handleChange("primary_cta_link", e.target.value)}
                    placeholder="/gallery"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Secondary CTA Text</label>
                  <input
                    type="text"
                    value={settings.secondary_cta_text || ""}
                    onChange={(e) => handleChange("secondary_cta_text", e.target.value)}
                    placeholder="Start a Project"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Secondary CTA Link</label>
                  <input
                    type="text"
                    value={settings.secondary_cta_link || ""}
                    onChange={(e) => handleChange("secondary_cta_link", e.target.value)}
                    placeholder="/contact"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <ImageUploader
                bucket="site-assets"
                folder="hero"
                value={settings.hero_image_url}
                onChange={(url) => handleChange("hero_image_url", url)}
                onRemove={() => handleChange("hero_image_url", null)}
                label="Hero Showcase Visual"
                description="Featured banner artwork or background composition"
                aspectRatio="wide"
              />
            </div>
          </div>
        )}

        {/* 3. About & Stats */}
        {activeTab === "about" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              About & Experience
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">About Heading</label>
                <input
                  type="text"
                  value={settings.about_heading || ""}
                  onChange={(e) => handleChange("about_heading", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">About Story / Bio</label>
                <textarea
                  rows={4}
                  value={settings.about_description || ""}
                  onChange={(e) => handleChange("about_description", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Experience Tagline</label>
                <input
                  type="text"
                  value={settings.experience_text || ""}
                  onChange={(e) => handleChange("experience_text", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <ImageUploader
                bucket="site-assets"
                folder="about"
                value={settings.about_image_url}
                onChange={(url) => handleChange("about_image_url", url)}
                onRemove={() => handleChange("about_image_url", null)}
                label="Artist Studio Profile Photo"
                description="Portrait or studio avatar"
                aspectRatio="portrait"
              />

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Stat: Projects</label>
                  <input
                    type="text"
                    value={settings.stats_projects || ""}
                    onChange={(e) => handleChange("stats_projects", e.target.value)}
                    placeholder="500+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Stat: Clients</label>
                  <input
                    type="text"
                    value={settings.stats_clients || ""}
                    onChange={(e) => handleChange("stats_clients", e.target.value)}
                    placeholder="120+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Stat: Categories</label>
                  <input
                    type="text"
                    value={settings.stats_categories || ""}
                    onChange={(e) => handleChange("stats_categories", e.target.value)}
                    placeholder="12+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Contact Info */}
        {activeTab === "contact" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              Direct Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Official Contact Email *</label>
                <input
                  type="email"
                  value={settings.contact_email || ""}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  placeholder="commissions@studio.art"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Discord Handle / Server</label>
                <input
                  type="text"
                  value={settings.discord || ""}
                  onChange={(e) => handleChange("discord", e.target.value)}
                  placeholder="artist#0001 or discord.gg/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Phone (Optional)</label>
                <input
                  type="text"
                  value={settings.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={settings.whatsapp || ""}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Social Links */}
        {activeTab === "social" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              Social Handles & Portfolio Profiles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">ArtStation URL</label>
                <input
                  type="url"
                  value={settings.artstation || ""}
                  onChange={(e) => handleChange("artstation", e.target.value)}
                  placeholder="https://artstation.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Behance URL</label>
                <input
                  type="url"
                  value={settings.behance || ""}
                  onChange={(e) => handleChange("behance", e.target.value)}
                  placeholder="https://behance.net/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.twitter || ""}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Instagram URL</label>
                <input
                  type="url"
                  value={settings.instagram || ""}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">YouTube Channel</label>
                <input
                  type="url"
                  value={settings.youtube || ""}
                  onChange={(e) => handleChange("youtube", e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">TikTok Profile</label>
                <input
                  type="url"
                  value={settings.tiktok || ""}
                  onChange={(e) => handleChange("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Theme Accents */}
        {activeTab === "theme" && (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
              Palette & Accent Accents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Primary Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primary_color || "#8b5cf6"}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={settings.primary_color || "#8b5cf6"}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Secondary Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondary_color || "#ec4899"}
                    onChange={(e) => handleChange("secondary_color", e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color || "#ec4899"}
                    onChange={(e) => handleChange("secondary_color", e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
