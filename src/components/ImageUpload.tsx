"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!supabase) return;
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("openfield-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Try a direct URL instead.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("openfield-images").getPublicUrl(path);

    onChange(publicUrl);
    setUploading(false);
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="Paste an image URL (or upload below)"
      />
      {!value && supabase && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-slate-400 disabled:opacity-50"
        >
          <Upload size={15} />
          {uploading ? "Uploading…" : "Or upload a file"}
        </button>
      )}
      {value && (
        <div className="relative">
          <img src={value} alt="Preview" className="h-28 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm hover:bg-slate-50"
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
