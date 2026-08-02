"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { canAccessDashboard } from "@/lib/auth-cookie";

export default function DashboardLoginPage() {
  return (
    <React.Suspense>
      <DashboardLoginForm />
    </React.Suspense>
  );
}

function DashboardLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  }

  React.useEffect(() => {
    if (user && canAccessDashboard(user)) {
      router.replace(searchParams.get("redirect") || "/dashboard");
      router.refresh();
    }
  }, [user, router, searchParams]);

  const signedInAsNonStaff = user && !canAccessDashboard(user);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restricted to admin and editor accounts.
        </p>
      </div>

      {signedInAsNonStaff ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-6 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {user.email} doesn&apos;t have access to the dashboard.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
            }}
          >
            Sign out and try another account
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      )}
    </div>
  );
}
