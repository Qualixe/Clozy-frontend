"use client";

import * as React from "react";
import { Loader2, Video as VideoIcon, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

async function uploadFile(file: File, token: string | null): Promise<{ url: string }> {
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
 * Click-to-browse / drag-and-drop video uploader, plus a plain URL field
 * for linking to an already-hosted video instead of uploading a file.
 * Uploads immediately on selection and reports back the resulting public
 * URL via `onChange`; typing in the URL field does the same directly. No
 * "choose from library" option — the shared media library/picker only
 * shows images.
 */
export function VideoUploader({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
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
      setError(err instanceof Error ? err.message : "Could not upload video.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "group relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted transition-colors",
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
          <video src={value} muted className="h-full w-full object-cover" />
        ) : uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <VideoIcon className="h-5 w-5 text-muted-foreground" />
        )}

        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label={value ? "Replace video" : "Upload video"}
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-black/30 disabled:pointer-events-none"
        />

        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove video"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      <div className="mt-2 space-y-1">
        <p className="text-xs text-muted-foreground">Or paste a video URL</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/video.mp4"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}

export default VideoUploader;
