"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import type { Category, SiteSettings } from "@/types/database";

interface ContactFormProps {
  categories: Category[];
  settings: SiteSettings;
}

const BUDGET_OPTIONS = [
  "Under $100",
  "$100 - $250",
  "$250 - $500",
  "$500 - $1,000",
  "$1,000+",
  "Flexible / Undecided",
];

function FormInternal({ categories, settings }: ContactFormProps) {
  const searchParams = useSearchParams();
  const initialProject = searchParams.get("project") || "";
  const initialService = searchParams.get("service") || searchParams.get("type") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [projectType, setProjectType] = useState(initialService || initialProject || "");
  const [budget, setBudget] = useState(BUDGET_OPTIONS[1]);
  const [message, setMessage] = useState(
    initialProject ? `Hi, I saw your artwork "${initialProject}" and would love to commission something similar!\n\n` : ""
  );
  // Honeypot field for anti-spam
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Anti-spam honeypot detection
    if (honeypot.trim().length > 0) {
      console.warn("Spam bot submission blocked.");
      setSubmitted(true);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    try {
      setSubmitting(true);

      const { error: insErr } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        discord_username: discordUsername.trim() || null,
        project_type: projectType || "General Commission",
        budget,
        message: message.trim(),
        status: "new",
      });

      if (insErr) {
        throw insErr;
      }

      setSubmitted(true);
      success("Your commission inquiry has been sent to the studio!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setErrorMessage(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Inquiry Received!
        </h3>
        <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
          Thank you for reaching out, <span className="font-semibold text-white">{name}</span>. We typically review new commission requests within 24–48 hours and will respond to <span className="font-mono text-purple-400">{email}</span>.
        </p>
        <div className="pt-4">
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail("");
              setMessage("");
              setDiscordUsername("");
            }}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Project Inquiry Form</h2>
        <p className="text-xs text-zinc-400">
          Tell us about your creative concept, desired deliverables, and schedule.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Anti-spam honeypot (hidden from real users) */}
      <input
        type="text"
        name="website_url_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">Your Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@creator.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Discord Handle (Optional)
          </label>
          <input
            type="text"
            value={discordUsername}
            onChange={(e) => setDiscordUsername(e.target.value)}
            placeholder="username#0000"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Project Discipline / Category *
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="">Select project type...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value="Custom Stream Branding">Custom Stream Branding</option>
            <option value="Multiple Deliverables">Multiple Deliverables</option>
            <option value="Other / Discussion">Other / Discussion</option>
          </select>
        </div>
      </div>

      {/* Budget Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-300">
          Estimated Budget Range (USD)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBudget(opt)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                budget === opt
                  ? "bg-purple-600/20 border-purple-500 text-purple-300 font-semibold shadow-md shadow-purple-600/10"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Message textarea */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-300">
          Tell Us About Your Project *
        </label>
        <textarea
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Include details about character traits, references, deadlines, and where these assets will be featured..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-all resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Commission Request</span>
          </>
        )}
      </button>
    </form>
  );
}

export function ContactForm(props: ContactFormProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading form...</div>}>
      <FormInternal {...props} />
    </Suspense>
  );
}
