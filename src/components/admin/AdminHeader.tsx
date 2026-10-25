"use client";

import React from "react";
import Link from "next/link";
import { Menu, Plus, Bell } from "lucide-react";

interface AdminHeaderProps {
  onToggleMobile: () => void;
  title?: string;
}

export function AdminHeader({ onToggleMobile, title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/artworks/new"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Artwork</span>
        </Link>
      </div>
    </header>
  );
}
