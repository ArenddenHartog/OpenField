"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  imageUrl?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  name: string;
}

function toEmbedUrl(url: string): string {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export function MediaGallery({ imageUrl, mediaUrls, videoUrl, name }: MediaGalleryProps) {
  const images = mediaUrls && mediaUrls.length > 0 ? mediaUrls : imageUrl ? [imageUrl] : [];
  const items: Array<{ type: "video" | "image"; src: string }> = [
    ...(videoUrl ? [{ type: "video" as const, src: videoUrl }] : []),
    ...images.map((src) => ({ type: "image" as const, src })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (items.length === 0) return null;

  const active = items[activeIndex];

  return (
    <div className="mb-5">
      {/* Main preview */}
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl bg-slate-100"
        onClick={() => active.type === "image" && setLightboxOpen(true)}
      >
        {active.type === "video" ? (
          <iframe
            src={toEmbedUrl(active.src)}
            title={name}
            className="h-44 w-full md:h-56"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img src={active.src} alt={name} className="h-44 w-full object-cover md:h-56" />
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {items.map((item, i) => (
            <button
              key={item.src + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                activeIndex === i ? "border-emerald-700" : "border-transparent"
              )}
            >
              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
                  <Play size={16} />
                </div>
              ) : (
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && active.type === "image" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={active.src} alt={name} className="max-h-full max-w-full rounded-xl object-contain" />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
