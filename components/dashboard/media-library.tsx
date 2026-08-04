"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { UploadedMedia } from "@/components/dashboard/image-uploader";

export function MediaLibrary({ media }: { media: UploadedMedia[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<UploadedMedia | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
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
      }

      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${pendingDelete.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }
      setPendingDelete(null);
      router.refresh();
    } catch {
      // Swallow — the confirm dialog stays open so the user can retry.
    } finally {
      setDeleting(false);
    }
  }

  function copyUrl(item: UploadedMedia) {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    });
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input p-8 text-center transition-colors",
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
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
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
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF, or AVIF — up to 8MB</p>
        {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {media.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No uploads yet — add your first image above.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className="group relative space-y-1.5">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Copy URL"
                    onClick={() => copyUrl(item)}
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete"
                    onClick={() => setPendingDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="truncate text-xs font-medium text-foreground">{item.filename}</p>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingDelete?.filename}&quot; will be permanently removed. If it's still in
              use on a product or category, that image will break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MediaLibrary;
