"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Crosshair } from "lucide-react";
import type { SiteSettings, Category } from "@/types/database";

interface NavbarProps {
  settings?: SiteSettings | null;
  categories?: Category[];
}

export function Navbar({ settings, categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "OVERVIEW", code: "01" },
    { href: "/gallery", label: "ALL ARTWORKS", code: "02" },
    { href: "/about", label: "STUDIO PROTOCOL", code: "03" },
    { href: "/contact", label: "COMMISSION", code: "04" },
  ];

  const siteName = settings?.site_name || "LUMINA // ART STUDIO";
  const ctaText = settings?.secondary_cta_text || "INITIATE PROJECT";
  const ctaLink = settings?.secondary_cta_link || "/contact";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#090a0f]/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Tactical Brand Monogram */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.site_logo_url ? (
              <div className="relative h-8 w-32">
                <Image
                  src={settings.site_logo_url}
                  alt={siteName}
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#ff4655] text-black flex items-center justify-center font-extrabold text-sm font-mono shadow-md shadow-[#ff4655]/30 group-hover:scale-105 transition-transform">
                  <Crosshair className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold tracking-tighter text-white text-base block font-mono">
                    {siteName}
                  </span>
                  <span className="tactical-mono text-[9px] text-[#ff4655] tracking-widest block font-bold">
                    DIGITAL DESIGN ATELIER // V.04
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Tactical Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold font-mono tracking-wider transition-colors relative py-1.5 flex items-center gap-1.5 ${
                    isActive ? "text-[#ff4655]" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] text-zinc-600 font-mono">[{link.code}]</span>
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff4655]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Red Chamfer CTA */}
          <div className="flex items-center gap-4">
            <Link
              href={ctaLink}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 chamfer-btn bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-mono font-extrabold tracking-wider shadow-lg shadow-[#ff4655]/25"
            >
              <span>{ctaText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex flex-col justify-between bg-[#090a0f]/98 backdrop-blur-2xl p-6 pt-24 animate-in fade-in">
          <div className="space-y-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff4655] px-2 font-bold">
              // TACTICAL SYSTEM NAV
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold font-mono tracking-wider flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-[#ff4655]/15 text-[#ff4655] border-l-4 border-[#ff4655]"
                        : "text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-zinc-600">[{link.code}]</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-zinc-900 space-y-3">
            <Link
              href={ctaLink}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 chamfer-btn bg-[#ff4655] text-white text-xs font-mono font-bold tracking-widest shadow-xl"
            >
              <span>{ctaText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
