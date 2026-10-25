"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; caption?: string | null; title?: string }>;
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
}

export function Lightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: LightboxProps) {
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(images.length - 1);
    }
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onIndexChange(0);
    }
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div
          className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-purple-400 bg-purple-950/60 border border-purple-500/20 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
            {currentImage.title && (
              <span className="text-sm font-medium text-zinc-300 hidden sm:inline-block">
                {currentImage.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(currentImage.url, "_blank");
                }
              }}
              title="Open full resolution in new tab"
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-purple-900/40 text-zinc-400 hover:text-white transition-all border border-zinc-800"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-rose-900/40 text-zinc-400 hover:text-white transition-all border border-zinc-800"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Navigation Button */}
        {hasMultiple && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-zinc-900/80 hover:bg-purple-950/80 text-zinc-300 hover:text-white border border-zinc-800 transition-all backdrop-blur-md shadow-xl"
            aria-label="Previous artwork image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Main Artwork Preview with Motion */}
        <div
          className="relative max-w-7xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center p-4 md:p-12 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            key={currentImage.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
              <Image
                src={currentImage.url}
                alt={currentImage.caption || currentImage.title || "Artwork preview"}
                fill
                sizes="100vw"
                className="object-contain drop-shadow-2xl select-none"
                priority
              />
            </div>
          </motion.div>

          {currentImage.caption && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm md:text-base text-zinc-300 mt-4 max-w-2xl px-4 py-2 rounded-lg bg-zinc-900/70 border border-zinc-800"
            >
              {currentImage.caption}
            </motion.p>
          )}
        </div>

        {/* Next Navigation Button */}
        {hasMultiple && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-zinc-900/80 hover:bg-purple-950/80 text-zinc-300 hover:text-white border border-zinc-800 transition-all backdrop-blur-md shadow-xl"
            aria-label="Next artwork image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Thumbnail Strip for multiple images */}
        {hasMultiple && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === currentIndex
                    ? "border-purple-500 scale-105 shadow-md shadow-purple-500/30"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumb ${idx + 1}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
