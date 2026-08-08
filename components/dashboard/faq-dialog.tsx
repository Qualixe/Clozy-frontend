"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import type { Faq } from "@/lib/get-faqs";

type FaqForm = {
  question: string;
  answer: string;
  status: "draft" | "published";
};

function toForm(faq?: Faq): FaqForm {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    status: faq?.status ?? "published",
  };
}

export function FaqDialog({
  faq,
  trigger,
}: {
  /** Pass an existing FAQ to edit it; omit to create a new one. */
  faq?: Faq;
  /** Custom trigger element (e.g. an Edit icon button). Defaults to an "Add FAQ" button. */
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const { token } = useAuth();
  const isEditing = !!faq;

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<FaqForm>(toForm(faq));
  const [questionError, setQuestionError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function update<K extends keyof FaqForm>(key: K, value: FaqForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "question") setQuestionError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(toForm(faq));
      setQuestionError(null);
      setSubmitError(null);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.question.trim()) {
      setQuestionError("Question is required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/faqs/${faq.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/faqs`;

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

      setOpen(false);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save FAQ."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this question and its answer."
                : "Add a question and answer to your FAQ page."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question">Question</Label>
              <Textarea
                id="faq-question"
                rows={2}
                placeholder="e.g. How long does shipping take?"
                value={form.question}
                onChange={(e) => update("question", e.target.value)}
                aria-invalid={!!questionError}
              />
              {questionError && (
                <p className="text-xs text-destructive">{questionError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={5}
                placeholder="Write the answer shown when this question is expanded"
                value={form.answer}
                onChange={(e) => update("answer", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faq-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => value && update("status", value as FaqForm["status"])}
              >
                <SelectTrigger id="faq-status" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-destructive">{submitError}</p>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FaqDialog;
