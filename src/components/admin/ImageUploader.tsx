"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFileToBucket } from "@/lib/supabase/storage";
import { useToast } from "@/components/shared/Toast";

interface ImageUploaderProps {
  bucket: "artworks" | "categories" | "site-assets" | "service-images";
  folder?: string;
  value?: string | null;
  onChange: (url: string, storagePath?: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | "auto";
}

export function ImageUploader({
  bucket,
  folder = "uploads",
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  description = "PNG, JPG, WEBP up to 10MB",
  aspectRatio = "video",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      error("Please upload a valid image file (JPG, PNG, WEBP, or GIF)");
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      error("Image size must be less than 10MB");
      return;
    }

    try {
      setIsUploading(true);
      const ext = file.name.split(".").pop() || "webp";
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const path = `${folder}/${cleanFileName}`;

      const result = await uploadFileToBucket(bucket, path, file);
      if (result) {
        onChange(result.publicUrl, result.storagePath);
        success("Image uploaded successfully");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Upload failed";
      error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
    auto: "h-48",
  }[aspectRatio];

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}

      {value ? (
        <div className={`relative w-full ${aspectClasses} rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group`}>
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-xs font-medium text-white border border-zinc-700 transition-colors shadow-lg"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative w-full ${aspectClasses} rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
            isDragOver
              ? "border-purple-500 bg-purple-950/20"
              : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/40"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-zinc-400">Uploading image to storage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:text-purple-400 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-purple-400 hover:text-purple-300">Click to upload</span>{" "}
                <span className="text-zinc-500">or drag and drop</span>
              </div>
              {description && <p className="text-xs text-zinc-500">{description}</p>}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
