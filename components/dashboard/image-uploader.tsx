"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export type UploadedMedia = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

async function uploadFile(file: File, token: string | null): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.errors?.file?.[0] ?? body?.message ?? `Upload failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Click-to-browse / drag-and-drop image uploader. Uploads immediately on
 * selection and reports back the resulting public URL via `onChange`.
 */
export function ImageUploader({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  /** Smaller (9x9) box for use inside a list row, vs a full square dropzone. */
  compact?: boolean;
}) {
  const { token } = useAuth();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const media = await uploadFile(file, token);
      onChange(media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "group relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted transition-colors",
          compact ? "h-9 w-9 rounded-md" : "aspect-square w-full",
          dragOver && "border-primary bg-primary/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : uploading ? (
          <Loader2 className={cn("animate-spin text-muted-foreground", compact ? "h-3.5 w-3.5" : "h-5 w-5")} />
        ) : (
          <ImagePlus className={cn("text-muted-foreground", compact ? "h-3.5 w-3.5" : "h-5 w-5")} />
        )}

        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className={cn("animate-spin text-foreground", compact ? "h-3.5 w-3.5" : "h-5 w-5")} />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label={value ? "Replace image" : "Upload image"}
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-black/30 disabled:pointer-events-none"
        />

        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80",
              compact ? "right-0.5 top-0.5 h-4 w-4" : "right-1.5 top-1.5 h-6 w-6"
            )}
          >
            <X className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default ImageUploader;
