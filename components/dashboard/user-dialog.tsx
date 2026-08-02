"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";

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
import type { AuthUser } from "@/lib/auth-cookie";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: AuthUser["role"];
  createdAt: string | null;
};

type UserForm = {
  name: string;
  email: string;
  role: AuthUser["role"];
  password: string;
};

const EMPTY_FORM: UserForm = { name: "", email: "", role: "user", password: "" };

export function UserDialog({ user }: { user?: ManagedUser }) {
  const router = useRouter();
  const { token } = useAuth();
  const isEditing = !!user;

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<UserForm>(
    user
      ? { name: user.name, email: user.email, role: user.role, password: "" }
      : EMPTY_FORM
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
      setSubmitting(false);
      setForm(
        user
          ? { name: user.name, email: user.email, role: user.role, password: "" }
          : EMPTY_FORM
      );
    }
  }

  function update<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!isEditing && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/users`;

      const payload: Record<string, string> = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (form.password) payload.password = form.password;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
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

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this account's details and role."
                : "Create a new admin, editor, or customer account."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v as AuthUser["role"])}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-password">
                {isEditing ? "New password (optional)" : "Password"}
              </Label>
              <Input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={isEditing ? "Leave blank to keep current password" : undefined}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserDialog;
