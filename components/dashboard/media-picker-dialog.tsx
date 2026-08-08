"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Loader2, Search, UploadCloud } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { UploadedMedia } from "@/components/dashboard/image-uploader";

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
  /** Allow selecting more than one image before confirming. Defaults to true. */
  multiple?: boolean;
}) {
  const { token } = useAuth();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [media, setMedia] = React.useState<UploadedMedia[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const loadMedia = React.useCallback(() => {
    setStatus("loading");
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: UploadedMedia[]) => {
        setMedia(data);
        setStatus("ready");
        return data;
      })
      .catch(() => {
        setStatus("error");
        return [] as UploadedMedia[];
      });
  }, [token]);

  React.useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(new Set());
    setUploadError(null);
    loadMedia();
  }, [open, loadMedia]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded: UploadedMedia[] = [];
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.errors?.file?.[0] ?? body?.message ?? `Upload failed with status ${res.status}`
          );
        }
        uploaded.push(await res.json());
      }

      await loadMedia();
      setSelected((current) => {
        const next = multiple ? new Set(current) : new Set<string>();
        uploaded.forEach((item) => next.add(item.id));
        return next;
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  function toggleSelect(item: UploadedMedia) {
    setSelected((current) => {
      if (!multiple) {
        return current.has(item.id) ? new Set<string>() : new Set([item.id]);
      }
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  function confirmSelection() {
    const urls = media.filter((item) => selected.has(item.id)).map((item) => item.url);
    if (urls.length === 0) return;
    onSelect(urls);
    onOpenChange(false);
  }

  const filtered = media.filter(
    (item) =>
      item.mimeType.startsWith("image/") &&
      item.filename.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select file</DialogTitle>
          <DialogDescription>
            {multiple ? "Upload new images or pick from your library." : "Upload a new image or pick from your library."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input p-6 text-center transition-colors",
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
            uploadFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            Drag and drop images here, or{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              browse
            </button>
          </p>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          )}

          {status === "error" && (
            <p className="py-16 text-center text-sm text-destructive">
              Could not load your media library.
            </p>
          )}

          {status === "ready" && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {media.length === 0 ? "No uploads yet." : "No files match your search."}
            </p>
          )}

          {status === "ready" && filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item)}
                    title={item.filename}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-shadow",
                      isSelected ? "border-primary ring-2 ring-primary" : "border-border"
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <div
                      className={cn(
                        "absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded border bg-background/90 transition-opacity",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground opacity-100"
                          : "border-border opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={selected.size === 0} onClick={confirmSelection}>
            Done{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MediaPickerDialog;
