"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

export type SmsRecipient = { name: string; phone: string };

export function SmsPromotionalForm({
  recipients,
}: {
  recipients: SmsRecipient[];
}) {
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [extraNumbers, setExtraNumbers] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ sent: number; failed: number } | null>(
    null
  );

  const filtered = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.phone.includes(query)
  );

  function toggle(phone: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((current) => {
      const allSelected = filtered.every((r) => current.has(r.phone));
      const next = new Set(current);
      for (const r of filtered) {
        if (allSelected) next.delete(r.phone);
        else next.add(r.phone);
      }
      return next;
    });
  }

  const extraList = extraNumbers
    .split(/[\n,]/)
    .map((n) => n.trim())
    .filter(Boolean);

  const totalRecipients = new Set([...selected, ...extraList]).size;

  async function handleSend(e: React.SubmitEvent) {
    e.preventDefault();

    const allRecipients = Array.from(new Set([...selected, ...extraList]));
    if (allRecipients.length === 0 || !message.trim()) return;

    setSending(true);
    setSendError(null);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sms/promotional`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ recipients: allRecipients, message }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setResult(body);
      setMessage("");
      setSelected(new Set());
      setExtraNumbers("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Could not send the promotional SMS."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Recipients from past orders</Label>
          <Button type="button" variant="outline" size="sm" onClick={toggleAllFiltered}>
            {filtered.length > 0 && filtered.every((r) => selected.has(r.phone))
              ? "Deselect all"
              : "Select all"}
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
          {filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No matching customers.
            </p>
          )}
          {filtered.map((r) => (
            <label
              key={r.phone}
              className="flex cursor-pointer items-center gap-3 border-b border-border p-3 text-sm last:border-b-0 hover:bg-muted"
            >
              <Checkbox
                checked={selected.has(r.phone)}
                onCheckedChange={() => toggle(r.phone)}
              />
              <span className="flex-1">
                <span className="block text-foreground">{r.name}</span>
                <span className="block text-xs text-muted-foreground">{r.phone}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="extraNumbers">Additional numbers (optional)</Label>
          <Textarea
            id="extraNumbers"
            rows={2}
            placeholder="One per line or comma-separated, e.g. 017XXXXXXXX"
            value={extraNumbers}
            onChange={(e) => setExtraNumbers(e.target.value)}
          />
        </div>
      </div>

      <div className="h-fit space-y-4 rounded-xl border border-border p-5">
        <div className="space-y-1.5">
          <Label htmlFor="promoMessage">Message</Label>
          <Textarea
            id="promoMessage"
            rows={5}
            placeholder="e.g. Flat 20% off this weekend only — use code SAVE20 at checkout!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/1000 characters
          </p>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          {totalRecipients} recipient{totalRecipients === 1 ? "" : "s"} selected
        </p>

        {sendError && <p className="text-sm text-destructive">{sendError}</p>}

        {result && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <Check className="h-4 w-4" />
            Sent to {result.sent}, failed for {result.failed}.
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={sending || totalRecipients === 0 || !message.trim()}
        >
          {sending ? "Sending…" : `Send to ${totalRecipients || ""}`.trim()}
        </Button>
      </div>
    </form>
  );
}

export default SmsPromotionalForm;
