"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { VideoUploader } from "@/components/dashboard/video-uploader";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { useAuth } from "@/lib/auth-context";
import type { VideoSectionData } from "@/components/video-section";

type ItemForm = {
  key: string;
  videoUrl: string;
  posterUrl: string;
  caption: string;
};

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `video-${keyCounter}`;
}

function toForm(item: VideoSectionData["items"][number]): ItemForm {
  return {
    key: item.id || nextKey(),
    videoUrl: item.videoUrl,
    posterUrl: item.posterUrl ?? "",
    caption: item.caption ?? "",
  };
}

export function ThemeVideoSectionForm({ initial }: { initial: VideoSectionData }) {
  const router = useRouter();
  const { token } = useAuth();

  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [heading, setHeading] = React.useState(initial.heading);
  const [items, setItems] = React.useState<ItemForm[]>(() => initial.items.map(toForm));
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update<K extends keyof ItemForm>(key: string, field: K, value: ItemForm[K]) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
    setSaved(false);
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { key: nextKey(), videoUrl: "", posterUrl: "", caption: "" },
    ]);
    setSaved(false);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
    setSaved(false);
  }

  function moveItem(key: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/video-section`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enabled,
          heading: heading || null,
          items: items
            .filter((item) => item.videoUrl)
            .map((item) => ({
              videoUrl: item.videoUrl,
              posterUrl: item.posterUrl || null,
              caption: item.caption || null,
            })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save the video section."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Show this section
          </p>
          <p className="text-xs text-muted-foreground">
            Turn the video section on or off on the homepage.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            setSaved(false);
          }}
        />
      </div>

      <div className="max-w-md space-y-1.5">
        <Label htmlFor="video-heading">Heading</Label>
        <Input
          id="video-heading"
          placeholder="Style In Motion"
          value={heading}
          onChange={(e) => {
            setHeading(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.key} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Video {i + 1}</p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => moveItem(item.key, -1)}
                >
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === items.length - 1}
                  onClick={() => moveItem(item.key, 1)}
                >
                  Move down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove video"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">
                  Video
                </Label>
                <VideoUploader
                  value={item.videoUrl}
                  onChange={(url) => update(item.key, "videoUrl", url)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Poster image (optional)
                  </Label>
                  <ImageUploader
                    className="max-w-[140px]"
                    compact={false}
                    value={item.posterUrl}
                    onChange={(url) => update(item.key, "posterUrl", url)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown while the video loads.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`caption-${item.key}`}
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Caption
                  </Label>
                  <Input
                    id={`caption-${item.key}`}
                    placeholder="e.g. Styled for everyday wear"
                    value={item.caption}
                    onChange={(e) => update(item.key, "caption", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No videos yet — add one to start building this section.
          </p>
        )}

        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" />
          Add video
        </Button>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
        {saved && !submitting && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

export default ThemeVideoSectionForm;
