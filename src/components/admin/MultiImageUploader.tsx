"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { uploadFileToBucket } from "@/lib/supabase/storage";
import { useToast } from "@/components/shared/Toast";

export interface GalleryImageItem {
  id?: string;
  image_url: string;
  storage_path?: string | null;
  caption?: string | null;
  sort_order: number;
}

interface MultiImageUploaderProps {
  bucket?: "artworks";
  folder?: string;
  images: GalleryImageItem[];
  onChange: (images: GalleryImageItem[]) => void;
  label?: string;
}

export function MultiImageUploader({
  bucket = "artworks",
  folder = "gallery",
  images,
  onChange,
  label = "Additional Gallery Images",
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  const handleFiles = async (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    );

    if (validFiles.length === 0) {
      error("No valid image files found");
      return;
    }

    try {
      setIsUploading(true);
      const newItems: GalleryImageItem[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`);

        const ext = file.name.split(".").pop() || "webp";
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const path = `${folder}/${cleanFileName}`;

        const res = await uploadFileToBucket(bucket, path, file);
        if (res) {
          newItems.push({
            image_url: res.publicUrl,
            storage_path: res.storagePath,
            caption: file.name.replace(/\.[^/.]+$/, ""),
            sort_order: images.length + newItems.length + 1,
          });
        }
      }

      onChange([...images, ...newItems]);
      success(`Added ${newItems.length} images to gallery`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Multi-upload failed";
      error(errMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.map((img, i) => ({ ...img, sort_order: i + 1 })));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    onChange(copy.map((img, i) => ({ ...img, sort_order: i + 1 })));
  };

  const updateCaption = (index: number, caption: string) => {
    const copy = [...images];
    copy[index] = { ...copy[index], caption };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-zinc-300">{label}</label>
          <p className="text-xs text-zinc-500">
            Add closeups, alternative angles, wireframes, or breakdown images.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
          {images.length} images
        </span>
      </div>

      {/* Grid of Existing Gallery Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((item, idx) => (
            <div
              key={item.id || item.image_url + idx}
              className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-2 space-y-2 flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/40">
                <Image
                  src={item.image_url}
                  alt={item.caption || "Gallery item"}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-950/90 text-rose-300 hover:bg-rose-900 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2 left-2 flex gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, "up")}
                      className="p-1 rounded bg-black/70 hover:bg-zinc-800 text-zinc-300 transition-colors"
                      title="Move left"
                    >
                      <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, "down")}
                      className="p-1 rounded bg-black/70 hover:bg-zinc-800 text-zinc-300 transition-colors"
                      title="Move right"
                    >
                      <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={item.caption || ""}
                onChange={(e) => updateCaption(idx, e.target.value)}
                placeholder="Image caption / angle"
                className="w-full text-xs px-2 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`w-full py-8 px-4 rounded-xl border-2 border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-950/40 hover:bg-zinc-900/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isUploading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            <p className="text-sm text-zinc-300 font-medium">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800">
              <UploadCloud className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Drop images or <span className="text-purple-400">browse</span>
            </p>
            <p className="text-xs text-zinc-500">Supports selecting multiple files at once</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
      />
    </div>
  );
}
