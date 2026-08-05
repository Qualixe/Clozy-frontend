"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, GripVertical, ImageOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MediaPickerDialog } from "@/components/dashboard/media-picker-dialog";
import { useAuth } from "@/lib/auth-context";

export type HeroSlideAdmin = {
  id: string;
  eyebrow: string | null;
  ghostText: string | null;
  headingLine1: string;
  headingLine2: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  textColor: string;
};

type SlideForm = {
  key: string;
  eyebrow: string;
  ghostText: string;
  headingLine1: string;
  headingLine2: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  textColor: string;
};

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `slide-${keyCounter}`;
}

function toForm(slide: HeroSlideAdmin): SlideForm {
  return {
    key: slide.id || nextKey(),
    eyebrow: slide.eyebrow ?? "",
    ghostText: slide.ghostText ?? "",
    headingLine1: slide.headingLine1 ?? "",
    headingLine2: slide.headingLine2 ?? "",
    body: slide.body ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    ctaHref: slide.ctaHref ?? "",
    image: slide.image ?? "",
    gradientFrom: slide.gradientFrom ?? "#e8d9c3",
    gradientTo: slide.gradientTo ?? "#8a6a52",
    accentColor: slide.accentColor ?? "#8a4a34",
    textColor: slide.textColor ?? "#2b1d13",
  };
}

const EMPTY_SLIDE: Omit<SlideForm, "key"> = {
  eyebrow: "",
  ghostText: "",
  headingLine1: "",
  headingLine2: "",
  body: "",
  ctaLabel: "",
  ctaHref: "",
  image: "",
  gradientFrom: "#e8d9c3",
  gradientTo: "#8a6a52",
  accentColor: "#8a4a34",
  textColor: "#2b1d13",
};

// ---------------------------------------------------------------------------
// Small color input — native swatch + hex text kept in sync.
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme hero editor
// ---------------------------------------------------------------------------

export function ThemeHeroForm({ slides }: { slides: HeroSlideAdmin[] }) {
  const router = useRouter();
  const { token } = useAuth();

  const [items, setItems] = React.useState<SlideForm[]>(() =>
    slides.length > 0 ? slides.map(toForm) : []
  );
  const [imagePickerKey, setImagePickerKey] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update<K extends keyof SlideForm>(key: string, field: K, value: SlideForm[K]) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
    setSaved(false);
  }

  function addSlide() {
    setItems((current) => [...current, { key: nextKey(), ...EMPTY_SLIDE }]);
    setSaved(false);
  }

  function removeSlide(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
    setSaved(false);
  }

  function moveSlide(key: string, direction: -1 | 1) {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hero-slides`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          slides: items.map((item) => ({
            eyebrow: item.eyebrow || null,
            ghostText: item.ghostText || null,
            headingLine1: item.headingLine1,
            headingLine2: item.headingLine2 || null,
            body: item.body || null,
            ctaLabel: item.ctaLabel || null,
            ctaHref: item.ctaHref || null,
            image: item.image,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
            accentColor: item.accentColor,
            textColor: item.textColor,
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
        err instanceof Error ? err.message : "Could not save the hero section."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.key} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                Slide {i + 1}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => moveSlide(item.key, -1)}
                >
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === items.length - 1}
                  onClick={() => moveSlide(item.key, 1)}
                >
                  Move down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove slide"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeSlide(item.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
              {/* Image */}
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">
                  Image
                </Label>
                <button
                  type="button"
                  onClick={() => setImagePickerKey(item.key)}
                  className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-5 w-5" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                    Change
                  </span>
                </button>
              </div>

              {/* Text fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Eyebrow
                  </Label>
                  <Input
                    placeholder="New Collection"
                    value={item.eyebrow}
                    onChange={(e) => update(item.key, "eyebrow", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Ghost watermark text
                  </Label>
                  <Input
                    placeholder="AUTUMN"
                    value={item.ghostText}
                    onChange={(e) => update(item.key, "ghostText", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Heading — line 1
                  </Label>
                  <Input
                    placeholder="Layers Built For"
                    value={item.headingLine1}
                    onChange={(e) => update(item.key, "headingLine1", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Heading — line 2
                  </Label>
                  <Input
                    placeholder="The Season Ahead."
                    value={item.headingLine2}
                    onChange={(e) => update(item.key, "headingLine2", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Body
                  </Label>
                  <Textarea
                    rows={2}
                    placeholder="A short line about this collection."
                    value={item.body}
                    onChange={(e) => update(item.key, "body", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Button label
                  </Label>
                  <Input
                    placeholder="Explore More"
                    value={item.ctaLabel}
                    onChange={(e) => update(item.key, "ctaLabel", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Button link
                  </Label>
                  <Input
                    placeholder="/shop/autumn-edit"
                    value={item.ctaHref}
                    onChange={(e) => update(item.key, "ctaHref", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ColorField
                label="Gradient start"
                value={item.gradientFrom}
                onChange={(v) => update(item.key, "gradientFrom", v)}
              />
              <ColorField
                label="Gradient end"
                value={item.gradientTo}
                onChange={(v) => update(item.key, "gradientTo", v)}
              />
              <ColorField
                label="Button color"
                value={item.accentColor}
                onChange={(v) => update(item.key, "accentColor", v)}
              />
              <ColorField
                label="Text color"
                value={item.textColor}
                onChange={(v) => update(item.key, "textColor", v)}
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No slides yet — add one to start building the hero section.
          </p>
        )}

        <Button type="button" variant="outline" onClick={addSlide}>
          <Plus className="h-3.5 w-3.5" />
          Add slide
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

      <MediaPickerDialog
        open={imagePickerKey !== null}
        onOpenChange={(open) => {
          if (!open) setImagePickerKey(null);
        }}
        multiple={false}
        onSelect={([url]) => {
          if (imagePickerKey !== null) update(imagePickerKey, "image", url);
        }}
      />
    </form>
  );
}

export default ThemeHeroForm;
