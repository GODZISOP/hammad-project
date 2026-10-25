"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  FolderTree,
  Star,
  Eye,
  EyeOff,
  Mail,
  Plus,
  ArrowRight,
  Sparkles,
  Settings,
  Clock,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Artwork, Category, ContactMessage } from "@/types/database";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalCategories: 0,
    featuredArtworks: 0,
    publishedArtworks: 0,
    draftArtworks: 0,
    newMessages: 0,
  });
  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch Artworks
        const { data: artworksData } = await supabase
          .from("artworks")
          .select("*, category:categories(*)")
          .order("created_at", { ascending: false });

        const artworks = (artworksData as Artwork[]) || [];

        // 2. Fetch Categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });

        const cats = (categoriesData as Category[]) || [];

        // 3. Fetch Contact Messages
        const { data: messagesData } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        const msgs = (messagesData as ContactMessage[]) || [];

        // Calculate statistics
        const totalArtworks = artworks.length;
        const totalCategories = cats.length;
        const featuredArtworks = artworks.filter((a) => a.is_featured).length;
        const publishedArtworks = artworks.filter((a) => a.is_published).length;
        const draftArtworks = artworks.filter((a) => !a.is_published).length;
        const newMessages = msgs.filter((m) => m.status === "new").length;

        setStats({
          totalArtworks,
          totalCategories,
          featuredArtworks,
          publishedArtworks,
          draftArtworks,
          newMessages,
        });

        setRecentArtworks(artworks.slice(0, 5));
        setRecentMessages(msgs);
        setCategories(cats.slice(0, 6));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Artworks",
      value: stats.totalArtworks,
      icon: Palette,
      color: "from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/20",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      color: "from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20",
    },
    {
      label: "Featured Art",
      value: stats.featuredArtworks,
      icon: Star,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Published",
      value: stats.publishedArtworks,
      icon: Eye,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Drafts",
      value: stats.draftArtworks,
      icon: EyeOff,
      color: "from-zinc-500/20 to-zinc-600/10 text-zinc-400 border-zinc-700/50",
    },
    {
      label: "New Messages",
      value: stats.newMessages,
      icon: Mail,
      color: "from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Studio Management Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Your Creative Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your artworks, organize category tags, respond to commission inquiries, and update site details.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/artworks/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Artwork</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-xl border bg-gradient-to-br ${card.color} backdrop-blur-sm space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">{card.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {loading ? "..." : card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Artworks & Latest Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Artworks (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Recently Added Artworks</span>
            </h2>
            <Link
              href="/admin/artworks"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
            {recentArtworks.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No artworks uploaded yet. Click &quot;Add Artwork&quot; to publish your first piece.
              </div>
            ) : (
              recentArtworks.map((art) => (
                <div
                  key={art.id}
                  className="p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-zinc-800">
                      <Image
                        src={art.main_image_url}
                        alt={art.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{art.title}</h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {art.category?.name || "Uncategorized"} • {formatDate(art.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {art.is_featured && (
                      <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        art.is_published
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {art.is_published ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/admin/artworks/${art.id}/edit`}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium px-2.5 py-1 rounded-lg hover:bg-purple-950/40 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Contact Inquiries (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-400" />
              <span>Commission Inquiries</span>
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              <span>Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
            {recentMessages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No inquiries received yet.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 hover:bg-zinc-800/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{msg.name}</span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        msg.status === "new"
                          ? "bg-purple-950/80 text-purple-300 border border-purple-500/30 font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{msg.project_type || "General Inquiry"}</span>
                    <span>{formatDate(msg.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
