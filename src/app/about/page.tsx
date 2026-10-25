import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Award, CheckCircle2, Shield, Heart } from "lucide-react";
import {
  getSiteSettings,
  getActiveCategories,
  getActiveServices,
} from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "About The Studio // Creative Philosophy & Services",
  description:
    "Learn about our creative studio, character design workflow, 3D pipeline, and client experience.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [settings, categories, services] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getActiveServices(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Story & Obsession</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {settings.about_heading}
              </h1>

              <div className="space-y-4 text-base text-zinc-300 leading-relaxed">
                <p>{settings.about_description}</p>
                {settings.experience_text && (
                  <p className="text-sm font-mono text-purple-400 bg-purple-950/30 border border-purple-500/20 p-4 rounded-xl">
                    &ldquo;{settings.experience_text}&rdquo;
                  </p>
                )}
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
                <div>
                  <span className="text-3xl font-extrabold text-white font-mono block">
                    {settings.stats_projects}
                  </span>
                  <span className="text-xs text-zinc-400">Delivered Artworks</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white font-mono block">
                    {settings.stats_clients}
                  </span>
                  <span className="text-xs text-zinc-400">Streamers & Authors</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white font-mono block">
                    {settings.stats_categories}
                  </span>
                  <span className="text-xs text-zinc-400">Creative Styles</span>
                </div>
              </div>
            </div>

            {/* Profile Image (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/60">
                  <Image
                    src={
                      settings.about_image_url ||
                      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={settings.site_name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-900">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Artistic Integrity</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every line, texture map, and color palette is tailored specifically to your character or brand identity without shortcuts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Production Quality</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assets are formatted cleanly for Twitch, VTube Studio, Unity/VRChat, or print publishing with full resolution files.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Transparent Milestones</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Regular WIP updates throughout sketch, lineart, flat color, and rendering phases so revisions are smooth.
              </p>
            </div>
          </div>

          {/* Services Matrix */}
          {services.length > 0 && (
            <div className="space-y-8 pt-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Available Services & Packages
                </h2>
                <p className="text-xs text-zinc-400">
                  Ready to collaborate? Check our current commission offerings below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3"
                  >
                    <h3 className="text-base font-bold text-white">{svc.title}</h3>
                    {svc.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {svc.description}
                      </p>
                    )}
                    <Link
                      href={`/contact?service=${encodeURIComponent(svc.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium pt-2"
                    >
                      <span>Inquire Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Banner */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-purple-950/60 to-zinc-900 border border-purple-500/30 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to bring your characters and brand to life?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
              Send us a message with your project ideas, references, and deadline to receive a custom quote.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                <span>Get In Touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
