"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import type { Policy } from "@/lib/get-policies";

export type PolicyFormValues = {
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
};

const EMPTY_POLICY_FORM: PolicyFormValues = {
  title: "",
  slug: "",
  content: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

export function fromPolicy(policy: Policy): PolicyFormValues {
  return {
    title: policy.title,
    slug: policy.slug,
    content: policy.content,
    status: policy.status,
    seoTitle: policy.seoTitle ?? "",
    seoDescription: policy.seoDescription ?? "",
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PolicyForm({
  policyId,
  initialValue,
  onCancel,
  onSuccess,
}: {
  /** Pass an existing policy's id to update it via PUT; omit to create via POST. */
  policyId?: string;
  initialValue?: PolicyFormValues;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const isEditing = !!policyId;

  const [form, setForm] = React.useState<PolicyFormValues>(
    initialValue ?? EMPTY_POLICY_FORM
  );
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [titleError, setTitleError] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function update<K extends keyof PolicyFormValues>(
    key: K,
    value: PolicyFormValues[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
    setTitleError(false);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setTitleError(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/policies/${policyId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/policies`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : `Could not ${isEditing ? "update" : "create"} policy.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="policy-title">Title</Label>
            <Input
              id="policy-title"
              placeholder="e.g. Privacy Policy"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="policy-slug">Slug</Label>
            <Input
              id="policy-slug"
              placeholder="e.g. privacy-policy"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", slugify(e.target.value));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Visible at /policies/{form.slug || "…"}
            </p>
          </div>
        </section>

        <section className="space-y-1.5">
          <Label htmlFor="policy-status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              value && update("status", value as PolicyFormValues["status"])
            }
          >
            <SelectTrigger id="policy-status" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-1.5">
          <Label>Content</Label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => update("content", html)}
            placeholder="Write the policy's content…"
            minHeight="16rem"
          />
        </section>

        <section className="space-y-4">
          <Label>SEO</Label>
          <div className="space-y-1.5">
            <Label htmlFor="policy-seo-title" className="text-xs font-normal text-muted-foreground">
              Meta title
            </Label>
            <Input
              id="policy-seo-title"
              placeholder="Shown in search engine results"
              value={form.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="policy-seo-description"
              className="text-xs font-normal text-muted-foreground"
            >
              Meta description
            </Label>
            <Textarea
              id="policy-seo-description"
              rows={2}
              placeholder="A short summary for search engines"
              value={form.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
            />
          </div>
        </section>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save Changes"
                : "Create Policy"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default PolicyForm;
