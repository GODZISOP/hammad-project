"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface CategoryShareButtonProps {
  categoryName: string;
}

export function CategoryShareButton({ categoryName }: CategoryShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        success(`Direct link for "${categoryName}" copied to clipboard! Ready to send to your client.`);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-sm"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>Copy Client Link</span>
        </>
      )}
    </button>
  );
}
