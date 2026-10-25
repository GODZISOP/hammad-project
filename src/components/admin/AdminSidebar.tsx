"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  FolderTree,
  Briefcase,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/artworks", label: "Artworks", icon: Palette },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/settings", label: "Website Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-zinc-950 border-r border-zinc-800/80 p-5">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">
              STUDIO // ADMIN
            </span>
            <span className="text-[11px] font-mono text-purple-400">Creative CMS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-purple-400" : "text-zinc-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="space-y-2 pt-4 border-t border-zinc-800/80">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            View Live Website
          </span>
          <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            Live
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
