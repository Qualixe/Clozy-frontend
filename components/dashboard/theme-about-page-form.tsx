"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { ABOUT_VALUE_ICON_MAP } from "@/components/about-values";
import { useAuth } from "@/lib/auth-context";
import {
  ABOUT_VALUE_ICONS,
  type AboutPageData,
  type AboutValueIcon,
} from "@/lib/get-about-page";

type Stat = { key: string; value: string; label: string };
type Value = { key: string; icon: AboutValueIcon; title: string; description: string };

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `k-${keyCounter}`;
}

const ICON_LABELS: Record<AboutValueIcon, string> = {
  leaf: "Leaf",
  "pen-tool": "Pen",
  tag: "Tag",
  globe: "Globe",
  heart: "Heart",
  shield: "Shield",
  truck: "Truck",
  award: "Award",
  recycle: "Recycle",
  users: "Users",
  star: "Star",
  package: "Package",
};

export function ThemeAboutPageForm({ initial }: { initial: AboutPageData }) {
  const router = useRouter();
  const { token } = useAuth();

  const [heroBadge, setHeroBadge] = React.useState(initial.heroBadge);
  const [heroHeadingLine1, setHeroHeadingLine1] = React.useState(initial.heroHeadingLine1);
  const [heroHeadingLine2, setHeroHeadingLine2] = React.useState(initial.heroHeadingLine2);
  const [heroBody, setHeroBody] = React.useState(initial.heroBody);
  const [heroImage, setHeroImage] = React.useState(initial.heroImage);
  const [heroPrimaryCtaLabel, setHeroPrimaryCtaLabel] = React.useState(initial.heroPrimaryCtaLabel);
  const [heroPrimaryCtaHref, setHeroPrimaryCtaHref] = React.useState(initial.heroPrimaryCtaHref);
  const [heroSecondaryCtaLabel, setHeroSecondaryCtaLabel] = React.useState(initial.heroSecondaryCtaLabel);
  const [heroSecondaryCtaHref, setHeroSecondaryCtaHref] = React.useState(initial.heroSecondaryCtaHref);
  const [heroBadgeTitle, setHeroBadgeTitle] = React.useState(initial.heroBadgeTitle);
  const [heroBadgeValue, setHeroBadgeValue] = React.useState(initial.heroBadgeValue);
  const [heroBadgeSubtitle, setHeroBadgeSubtitle] = React.useState(initial.heroBadgeSubtitle);
  const [stats, setStats] = React.useState<Stat[]>(
    initial.heroStats.map((s) => ({ key: nextKey(), ...s }))
  );

  const [storyEyebrow, setStoryEyebrow] = React.useState(initial.storyEyebrow);
  const [storyHeading, setStoryHeading] = React.useState(initial.storyHeading);
  const [storyBody, setStoryBody] = React.useState(initial.storyBody);
  const [storyImage, setStoryImage] = React.useState(initial.storyImage);

  const [valuesEyebrow, setValuesEyebrow] = React.useState(initial.valuesEyebrow);
  const [valuesHeading, setValuesHeading] = React.useState(initial.valuesHeading);
  const [values, setValues] = React.useState<Value[]>(
    initial.values.map((v) => ({ key: nextKey(), ...v }))
  );

  const [ctaHeading, setCtaHeading] = React.useState(initial.ctaHeading);
  const [ctaBody, setCtaBody] = React.useState(initial.ctaBody);
  const [ctaButtonLabel, setCtaButtonLabel] = React.useState(initial.ctaButtonLabel);
  const [ctaButtonHref, setCtaButtonHref] = React.useState(initial.ctaButtonHref);
  const [seoTitle, setSeoTitle] = React.useState(initial.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial.seoDescription ?? "");

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function touch() {
    setSaved(false);
  }

  function addStat() {
    if (stats.length >= 4) return;
    setStats((current) => [...current, { key: nextKey(), value: "", label: "" }]);
    touch();
  }

  function updateStat(key: string, field: "value" | "label", value: string) {
    setStats((current) =>
      current.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
    touch();
  }

  function removeStat(key: string) {
    setStats((current) => current.filter((s) => s.key !== key));
    touch();
  }

  function addValue() {
    if (values.length >= 8) return;
    setValues((current) => [
      ...current,
      { key: nextKey(), icon: "leaf", title: "", description: "" },
    ]);
    touch();
  }

  function updateValue<K extends keyof Value>(key: string, field: K, value: Value[K]) {
    setValues((current) =>
      current.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    );
    touch();
  }

  function removeValue(key: string) {
    setValues((current) => current.filter((v) => v.key !== key));
    touch();
  }

  function moveValue(key: string, direction: -1 | 1) {
    setValues((current) => {
      const index = current.findIndex((v) => v.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    touch();
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/about-page`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          heroBadge: heroBadge || null,
          heroHeadingLine1: heroHeadingLine1 || null,
          heroHeadingLine2: heroHeadingLine2 || null,
          heroBody: heroBody || null,
          heroImage: heroImage || null,
          heroPrimaryCtaLabel: heroPrimaryCtaLabel || null,
          heroPrimaryCtaHref: heroPrimaryCtaHref || null,
          heroSecondaryCtaLabel: heroSecondaryCtaLabel || null,
          heroSecondaryCtaHref: heroSecondaryCtaHref || null,
          heroStats: stats
            .filter((s) => s.value && s.label)
            .map((s) => ({ value: s.value, label: s.label })),
          heroBadgeTitle: heroBadgeTitle || null,
          heroBadgeValue: heroBadgeValue || null,
          heroBadgeSubtitle: heroBadgeSubtitle || null,
          storyEyebrow: storyEyebrow || null,
          storyHeading: storyHeading || null,
          storyBody: storyBody || null,
          storyImage: storyImage || null,
          valuesEyebrow: valuesEyebrow || null,
          valuesHeading: valuesHeading || null,
          values: values
            .filter((v) => v.title && v.description)
            .map((v) => ({ icon: v.icon, title: v.title, description: v.description })),
          ctaHeading: ctaHeading || null,
          ctaBody: ctaBody || null,
          ctaButtonLabel: ctaButtonLabel || null,
          ctaButtonHref: ctaButtonHref || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
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
        err instanceof Error ? err.message : "Could not save the About page."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-8">
      {/* Hero */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Hero</h2>

        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Image</Label>
            <ImageUploader
              value={heroImage}
              onChange={(url) => {
                setHeroImage(url);
                touch();
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-badge">Badge</Label>
              <Input
                id="ap-hero-badge"
                placeholder="Since 2018"
                value={heroBadge}
                onChange={(e) => {
                  setHeroBadge(e.target.value);
                  touch();
                }}
              />
            </div>
            <div />
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-h1">Heading — line 1</Label>
              <Input
                id="ap-hero-h1"
                value={heroHeadingLine1}
                onChange={(e) => {
                  setHeroHeadingLine1(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-h2">Heading — line 2</Label>
              <Input
                id="ap-hero-h2"
                value={heroHeadingLine2}
                onChange={(e) => {
                  setHeroHeadingLine2(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ap-hero-body">Body</Label>
              <Textarea
                id="ap-hero-body"
                rows={3}
                value={heroBody}
                onChange={(e) => {
                  setHeroBody(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-cta1-label">Primary button label</Label>
              <Input
                id="ap-hero-cta1-label"
                value={heroPrimaryCtaLabel}
                onChange={(e) => {
                  setHeroPrimaryCtaLabel(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-cta1-href">Primary button link</Label>
              <Input
                id="ap-hero-cta1-href"
                value={heroPrimaryCtaHref}
                onChange={(e) => {
                  setHeroPrimaryCtaHref(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-cta2-label">Secondary button label</Label>
              <Input
                id="ap-hero-cta2-label"
                value={heroSecondaryCtaLabel}
                onChange={(e) => {
                  setHeroSecondaryCtaLabel(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-hero-cta2-href">Secondary button link</Label>
              <Input
                id="ap-hero-cta2-href"
                value={heroSecondaryCtaHref}
                onChange={(e) => {
                  setHeroSecondaryCtaHref(e.target.value);
                  touch();
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ap-hero-badge-title">Floating card — title</Label>
            <Input
              id="ap-hero-badge-title"
              placeholder="Trusted by"
              value={heroBadgeTitle}
              onChange={(e) => {
                setHeroBadgeTitle(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-hero-badge-value">Floating card — value</Label>
            <Input
              id="ap-hero-badge-value"
              placeholder="25,000+"
              value={heroBadgeValue}
              onChange={(e) => {
                setHeroBadgeValue(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-hero-badge-subtitle">Floating card — subtitle</Label>
            <Input
              id="ap-hero-badge-subtitle"
              placeholder="customers worldwide"
              value={heroBadgeSubtitle}
              onChange={(e) => {
                setHeroBadgeSubtitle(e.target.value);
                touch();
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Stats (up to 4)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addStat} disabled={stats.length >= 4}>
              <Plus className="h-3.5 w-3.5" />
              Add stat
            </Button>
          </div>
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-2">
              <Input
                placeholder="25K+"
                className="w-28"
                value={stat.value}
                onChange={(e) => updateStat(stat.key, "value", e.target.value)}
              />
              <Input
                placeholder="Happy Customers"
                value={stat.label}
                onChange={(e) => updateStat(stat.key, "label", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove stat"
                onClick={() => removeStat(stat.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Story */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Our Story</h2>

        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Image</Label>
            <ImageUploader
              value={storyImage}
              onChange={(url) => {
                setStoryImage(url);
                touch();
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ap-story-eyebrow">Eyebrow</Label>
              <Input
                id="ap-story-eyebrow"
                value={storyEyebrow}
                onChange={(e) => {
                  setStoryEyebrow(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-story-heading">Heading</Label>
              <Input
                id="ap-story-heading"
                value={storyHeading}
                onChange={(e) => {
                  setStoryHeading(e.target.value);
                  touch();
                }}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ap-story-body">
                Body (blank line between paragraphs)
              </Label>
              <Textarea
                id="ap-story-body"
                rows={8}
                value={storyBody}
                onChange={(e) => {
                  setStoryBody(e.target.value);
                  touch();
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Values */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Values</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ap-values-eyebrow">Eyebrow</Label>
            <Input
              id="ap-values-eyebrow"
              value={valuesEyebrow}
              onChange={(e) => {
                setValuesEyebrow(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-values-heading">Heading</Label>
            <Input
              id="ap-values-heading"
              value={valuesHeading}
              onChange={(e) => {
                setValuesHeading(e.target.value);
                touch();
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Value cards (up to 8)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addValue} disabled={values.length >= 8}>
              <Plus className="h-3.5 w-3.5" />
              Add value
            </Button>
          </div>

          {values.map((value, i) => {
            const Icon = ABOUT_VALUE_ICON_MAP[value.icon];
            return (
              <div key={value.key} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <Select
                    value={value.icon}
                    onValueChange={(v) => {
                      if (v) updateValue(value.key, "icon", v as AboutValueIcon);
                    }}
                  >
                    <SelectTrigger className="h-9 w-9 shrink-0 justify-center p-0 [&>svg]:hidden">
                      <Icon className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {ABOUT_VALUE_ICONS.map((iconName) => {
                        const OptionIcon = ABOUT_VALUE_ICON_MAP[iconName];
                        return (
                          <SelectItem key={iconName} value={iconName}>
                            <span className="flex items-center gap-2">
                              <OptionIcon className="h-4 w-4" />
                              {ICON_LABELS[iconName]}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Title"
                      value={value.title}
                      onChange={(e) => updateValue(value.key, "title", e.target.value)}
                    />
                    <Textarea
                      placeholder="Description"
                      rows={2}
                      value={value.description}
                      onChange={(e) =>
                        updateValue(value.key, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={i === 0}
                      onClick={() => moveValue(value.key, -1)}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={i === values.length - 1}
                      onClick={() => moveValue(value.key, 1)}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeValue(value.key)}
                      aria-label="Remove value"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Bottom CTA</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ap-cta-heading">Heading</Label>
            <Input
              id="ap-cta-heading"
              value={ctaHeading}
              onChange={(e) => {
                setCtaHeading(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ap-cta-body">Body</Label>
            <Textarea
              id="ap-cta-body"
              rows={2}
              value={ctaBody}
              onChange={(e) => {
                setCtaBody(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-cta-label">Button label</Label>
            <Input
              id="ap-cta-label"
              value={ctaButtonLabel}
              onChange={(e) => {
                setCtaButtonLabel(e.target.value);
                touch();
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-cta-href">Button link</Label>
            <Input
              id="ap-cta-href"
              value={ctaButtonHref}
              onChange={(e) => {
                setCtaButtonHref(e.target.value);
                touch();
              }}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* SEO */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">SEO</h2>

        <div className="space-y-1.5">
          <Label htmlFor="ap-seo-title" className="text-xs font-normal text-muted-foreground">
            Meta title
          </Label>
          <Input
            id="ap-seo-title"
            placeholder="Shown in search engine results"
            value={seoTitle}
            onChange={(e) => {
              setSeoTitle(e.target.value);
              touch();
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="ap-seo-description"
            className="text-xs font-normal text-muted-foreground"
          >
            Meta description
          </Label>
          <Textarea
            id="ap-seo-description"
            rows={2}
            placeholder="A short summary for search engines"
            value={seoDescription}
            onChange={(e) => {
              setSeoDescription(e.target.value);
              touch();
            }}
          />
        </div>
      </section>

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

export default ThemeAboutPageForm;
