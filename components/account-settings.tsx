"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export function AccountSettings() {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, string> = { name, email };
      if (password) payload.password = password;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.errors?.email?.[0] ??
          body?.errors?.name?.[0] ??
          body?.message ??
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const updated = await res.json();
      updateUser(updated);
      setPassword("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account-email">Email</Label>
          <Input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account-password">New password (optional)</Label>
          <Input
            id="account-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSaved(false);
            }}
            placeholder="Leave blank to keep current password"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
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
    </div>
  );
}

export default AccountSettings;
