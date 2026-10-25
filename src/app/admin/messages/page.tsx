"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Search,
  Trash2,
  CheckCircle,
  Archive,
  MessageSquare,
  Clock,
  User,
  DollarSign,
  Loader2,
  X,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";
import type { ContactMessage, MessageStatus } from "@/types/database";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  const { success, error } = useToast();
  const supabase = createClient();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setMessages((data as ContactMessage[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load messages";
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, newStatus: MessageStatus) => {
    try {
      const { error: err } = await supabase
        .from("contact_messages")
        .update({ status: newStatus })
        .eq("id", id);

      if (err) throw err;

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );

      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, status: newStatus });
      }

      success(`Message marked as ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      error(msg);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (err) throw err;

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (activeMessage?.id === id) {
        setActiveMessage(null);
      }
      success("Message deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      error(msg);
    }
  };

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (selectedStatus !== "all" && m.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(q);
        const emailMatch = m.email.toLowerCase().includes(q);
        const textMatch = m.message.toLowerCase().includes(q);
        const discordMatch = m.discord_username?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !textMatch && !discordMatch) return false;
      }
      return true;
    });
  }, [messages, selectedStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      read: messages.filter((m) => m.status === "read").length,
      replied: messages.filter((m) => m.status === "replied").length,
      archived: messages.filter((m) => m.status === "archived").length,
    };
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Mail className="w-6 h-6 text-pink-400" />
          <span>Commission Messages</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review, organize, and reply to client inquiries sent through the website contact form.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex gap-2 overflow-x-auto py-1">
          {[
            { id: "all", label: "All Messages", count: counts.all },
            { id: "new", label: "New", count: counts.new },
            { id: "read", label: "Read", count: counts.read },
            { id: "replied", label: "Replied", count: counts.replied },
            { id: "archived", label: "Archived", count: counts.archived },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedStatus === tab.id
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  tab.id === "new" && tab.count > 0
                    ? "bg-purple-500 text-white font-bold"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
        {loading ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs">Loading messages...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm">
            No messages found in this view.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setActiveMessage(msg);
                if (msg.status === "new") {
                  updateStatus(msg.id, "read");
                }
              }}
              className={`p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                msg.status === "new"
                  ? "bg-purple-950/20 hover:bg-purple-950/30"
                  : "hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    msg.status === "new"
                      ? "bg-purple-900/40 border-purple-500/30 text-purple-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{msg.name}</span>
                    <span className="text-xs text-zinc-500">&lt;{msg.email}&gt;</span>
                    {msg.discord_username && (
                      <span className="text-[11px] font-mono text-purple-400 bg-purple-950/50 border border-purple-500/20 px-1.5 py-0.2 rounded">
                        @{msg.discord_username}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{msg.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-800/60">
                <div className="flex items-center gap-2">
                  {msg.budget && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {msg.budget}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      msg.status === "new"
                        ? "bg-purple-900/80 text-purple-300 border border-purple-500/30 font-bold"
                        : msg.status === "replied"
                        ? "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                        : msg.status === "archived"
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                <span className="text-xs font-mono text-zinc-500">
                  {formatDate(msg.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Detail View Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Inquiry Details</span>
                <span className="text-xs font-mono text-zinc-500">
                  #{activeMessage.id.slice(0, 8)}
                </span>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Meta Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
              <div>
                <span className="text-zinc-500 block">Client Name</span>
                <span className="font-semibold text-white text-sm">{activeMessage.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Email Address</span>
                <a
                  href={`mailto:${activeMessage.email}`}
                  className="font-medium text-purple-400 hover:underline"
                >
                  {activeMessage.email}
                </a>
              </div>
              <div>
                <span className="text-zinc-500 block">Discord</span>
                <span className="font-mono text-zinc-300">
                  {activeMessage.discord_username || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Budget Range</span>
                <span className="font-mono text-emerald-400">
                  {activeMessage.budget || "Not specified"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block">Project Type</span>
                <span className="font-medium text-zinc-200">
                  {activeMessage.project_type || "General Custom Work"}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Message Content
              </label>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {activeMessage.message}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => deleteMessage(activeMessage.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs border border-rose-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Regarding your commission inquiry on LUMINA`}
                  onClick={() => updateStatus(activeMessage.id, "replied")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                {activeMessage.status !== "archived" ? (
                  <button
                    onClick={() => updateStatus(activeMessage.id, "archived")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(activeMessage.id, "read")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Unarchive</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
