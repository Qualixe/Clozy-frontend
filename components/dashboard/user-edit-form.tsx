"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import type { AuthUser } from "@/lib/auth-cookie";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  defaultPermissionsForRole,
  type Permission,
} from "@/lib/permissions";
import type { ManagedUser } from "@/components/dashboard/user-dialog";

export function UserEditForm({ user }: { user: ManagedUser }) {
  const router = useRouter();
  const { user: currentUser, token } = useAuth();

  const isSelf = currentUser?.id === user.id;
  const isOwnerRow = user.role === "owner";
  const roleAndPermissionsLocked = isSelf || isOwnerRow;

  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<AuthUser["role"]>(user.role);
  const [permissions, setPermissions] = React.useState<Set<Permission>>(
    new Set(user.permissions)
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function handleRoleChange(next: AuthUser["role"]) {
    setRole(next);
    setPermissions(new Set(defaultPermissionsForRole(next)));
    setSaved(false);
  }

  function togglePermission(permission: Permission) {
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
    setSaved(false);
  }

  const allPermissionsSelected = PERMISSIONS.every((p) => permissions.has(p));

  function toggleSelectAll() {
    setPermissions(new Set(allPermissionsSelected ? [] : PERMISSIONS));
    setSaved(false);
  }

  function toggleGroup(groupPermissions: Permission[]) {
    const allSelected = groupPermissions.every((p) => permissions.has(p));
    setPermissions((current) => {
      const next = new Set(current);
      for (const p of groupPermissions) {
        if (allSelected) next.delete(p);
        else next.add(p);
      }
      return next;
    });
    setSaved(false);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = { name, email, role };
      if (password) payload.password = password;
      // Omit entirely (rather than sending an empty/unchanged array) when
      // locked — the backend rejects self permission edits outright, and an
      // owner's permissions are meaningless (they bypass every check).
      if (!roleAndPermissionsLocked) payload.permissions = [...permissions];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
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

      setPassword("");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="user-name">Name</Label>
          <Input
            id="user-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-role">Role</Label>
          <Select
            value={role}
            disabled={roleAndPermissionsLocked}
            onValueChange={(v) => v && handleRoleChange(v as AuthUser["role"])}
          >
            <SelectTrigger id="user-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isOwnerRow && (
                <SelectItem value="owner" disabled>
                  Owner
                </SelectItem>
              )}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="user">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-password">New password (optional)</Label>
          <Input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSaved(false);
            }}
            placeholder="Leave blank to keep current password"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Permissions</p>
            <p className="text-xs text-muted-foreground">
              {isOwnerRow
                ? "The owner has full access to everything — permissions can't be restricted."
                : isSelf
                  ? "You can't change your own permissions — ask another owner or admin."
                  : "Exactly what this account can do, independent of its role's usual defaults."}
            </p>
          </div>
          {!roleAndPermissionsLocked && role !== "user" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={toggleSelectAll}
            >
              {allPermissionsSelected ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>

        {role === "user" && !roleAndPermissionsLocked ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            Customer accounts don&apos;t have dashboard permissions.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => {
              const groupAllSelected = group.permissions.every((p) => permissions.has(p));
              const groupSomeSelected = group.permissions.some((p) => permissions.has(p));
              return (
              <div key={group.title} className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                  <Checkbox
                    checked={isOwnerRow ? true : groupAllSelected}
                    indeterminate={!isOwnerRow && groupSomeSelected && !groupAllSelected}
                    disabled={roleAndPermissionsLocked}
                    onCheckedChange={() => toggleGroup(group.permissions)}
                  />
                  {group.title}
                </label>
                <div className="space-y-2 pl-2">
                  {group.permissions.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-2.5 text-sm text-foreground group-has-disabled/field:opacity-50"
                    >
                      <Checkbox
                        checked={
                          isOwnerRow ? true : permissions.has(permission)
                        }
                        disabled={roleAndPermissionsLocked}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      {PERMISSION_LABELS[permission]}
                    </label>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
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

export default UserEditForm;
