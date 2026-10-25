"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Lock, Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === "unauthorized" ? "Access denied. Admin privileges required." : null
  );

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Verify profile role
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileErr && profileErr.code !== "PGRST116") {
          console.warn("Profile fetch note:", profileErr);
        }

        if (profile && profile.role !== "admin" && profile.role !== "editor") {
          await supabase.auth.signOut();
          setErrorMsg("Account does not have admin permissions.");
          setLoading(false);
          return;
        }

        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Admin Portal</h1>
        <p className="text-xs text-zinc-400">
          Sign in with your verified Supabase administrative account.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>

      {/* Helpful Hint */}
      <div className="pt-4 border-t border-zinc-800/80 text-center space-y-3">
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          First-time setup? Add an admin user in your Supabase Auth dashboard, then ensure their profile has <span className="font-mono text-purple-400">role = &apos;admin&apos;</span>.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to website</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-pink-600/10 blur-[120px] pointer-events-none rounded-full" />

      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading admin portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
