"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUp,
  ExternalLink,
} from "lucide-react";
import type { SiteSettings, Category } from "@/types/database";

interface FooterProps {
  settings?: SiteSettings | null;
  categories?: Category[];
}

export function Footer({ settings, categories = [] }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const siteName = settings?.site_name || "Crytonix Solution";

  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800/80 pt-16 pb-12 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-600/10 blur-[80px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-blue-500/30 shadow-lg shadow-blue-600/20 bg-[#020c29]">
                <Image
                  src="/images/crytonix-icon.png"
                  alt="Crytonix Solution Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="font-bold tracking-tight text-white text-base">
                {siteName}
              </span>
            </Link>

            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              {settings?.footer_text ||
                "Elevating digital presence with bespoke characters, virtual avatars, and custom stream branding."}
            </p>
          </div>

          {/* Explore / Categories */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white block">
              Categories
            </span>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/gallery"
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  <span>All Categories</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white block">
              Commissions
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open for custom illustrations, Live2D rigging, 3D modeling, and branding projects.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>Start a Project</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            {settings?.copyright_text || `Â© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-zinc-300 transition-colors">
              Admin Portal
            </Link>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              title="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
