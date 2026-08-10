"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export type DiscountType = "percentage" | "fixed" | "free_shipping";

export type Discount = {
  id: string;
  code: string;
  type: DiscountType;
  value: number | null;
  minSubtotal: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};

type DiscountForm = {
  code: string;
  type: DiscountType;
  value: string;
  minSubtotal: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

/** `2026-08-06T12:00:00Z` -> `2026-08-06` for a date input's value. */
function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function toForm(discount?: Discount): DiscountForm {
  return {
    code: discount?.code ?? "",
    type: discount?.type ?? "percentage",
    value: discount?.value != null ? String(discount.value) : "",
    minSubtotal: discount?.minSubtotal != null ? String(discount.minSubtotal) : "",
    usageLimit: discount?.usageLimit != null ? String(discount.usageLimit) : "",
    startsAt: toDateInput(discount?.startsAt ?? null),
    endsAt: toDateInput(discount?.endsAt ?? null),
    active: discount?.active ?? true,
  };
}

export function DiscountDialog({
  discount,
  trigger,
}: {
  /** Pass an existing discount to edit it; omit to create a new one. */
  discount?: Discount;
  /** Custom trigger element (e.g. an Edit menu item). Defaults to an "Add Discount" button. */
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const { token } = useAuth();
  const isEditing = !!discount;

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<DiscountForm>(toForm(discount));
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function update<K extends keyof DiscountForm>(key: K, value: DiscountForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "code") setCodeError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(toForm(discount));
      setCodeError(null);
      setSubmitError(null);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.code.trim()) {
      setCodeError("Code is required.");
      return;
    }
    if (form.type !== "free_shipping" && !form.value.trim()) {
      setCodeError(null);
      setSubmitError("Enter a value for this discount type.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/discounts/${discount.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/discounts`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.type === "free_shipping" ? null : Number(form.value),
          minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          active: form.active,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.errors?.code?.[0] ??
          body?.message ??
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save discount."
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
              Add Discount
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Discount" : "Add Discount"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this discount code's rules."
                : "Create a code customers can enter at checkout."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="discount-code">Code</Label>
              <Input
                id="discount-code"
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                aria-invalid={!!codeError}
                className="uppercase"
              />
              {codeError && (
                <p className="text-xs text-destructive">{codeError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => {
                    if (value) update("type", value as DiscountType);
                  }}
                >
                  <SelectTrigger id="discount-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage off</SelectItem>
                    <SelectItem value="fixed">Fixed amount off</SelectItem>
                    <SelectItem value="free_shipping">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.type !== "free_shipping" && (
                <div className="space-y-1.5">
                  <Label htmlFor="discount-value">
                    {form.type === "percentage" ? "Percent off" : "Amount off (৳)"}
                  </Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min={0}
                    max={form.type === "percentage" ? 100 : undefined}
                    step="0.01"
                    placeholder={form.type === "percentage" ? "20" : "10.00"}
                    value={form.value}
                    onChange={(e) => update("value", e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount-min">Minimum order (৳)</Label>
                <Input
                  id="discount-min"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="No minimum"
                  value={form.minSubtotal}
                  onChange={(e) => update("minSubtotal", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount-usage-limit">Usage limit</Label>
                <Input
                  id="discount-usage-limit"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={(e) => update("usageLimit", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount-starts">Start date</Label>
                <Input
                  id="discount-starts"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => update("startsAt", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount-ends">End date</Label>
                <Input
                  id="discount-ends"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => update("endsAt", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to disable this code without deleting it.
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => update("active", checked)}
              />
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
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DiscountDialog;
