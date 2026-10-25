import React from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, Phone, Sparkles, CheckCircle } from "lucide-react";
import { getSiteSettings, getActiveCategories } from "@/lib/data";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ContactForm } from "@/components/public/ContactForm";

export const metadata: Metadata = {
  title: "Start a Project // Commission Art & Digital Assets",
  description:
    "Get in touch for custom character illustration, 3D avatars, Live2D rigging, and stream branding inquiries.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar settings={settings} />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commission Inquiries</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Let&apos;s Build Something Extraordinary
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Have an upcoming stream debut, book publication, game character concept, or avatar idea? Reach out to discuss details and secure your slot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Direct Contact Information (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
                <h2 className="text-lg font-bold text-white tracking-tight">Direct Channels</h2>

                <div className="space-y-4 text-xs">
                  {settings.contact_email && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Email Address</span>
                        <a
                          href={`mailto:${settings.contact_email}`}
                          className="font-semibold text-zinc-200 hover:text-purple-300 text-sm transition-colors"
                        >
                          {settings.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings.discord && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Discord Contact</span>
                        <span className="font-mono font-semibold text-zinc-200 text-sm">
                          {settings.discord}
                        </span>
                      </div>
                    </div>
                  )}

                  {settings.phone && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Direct Line</span>
                        <span className="font-mono text-zinc-300">{settings.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Commission FAQs */}
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-purple-400">
                  What to expect
                </h3>
                <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Detailed quote breakdown and turnaround estimate within 48 hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>WIP check-ins at rough sketch, lineart, and final render stages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Commercial licensing and high-res master source file deliveries.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Interactive Commission Form (7 cols) */}
            <div className="lg:col-span-7">
              <ContactForm categories={categories} settings={settings} />
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
