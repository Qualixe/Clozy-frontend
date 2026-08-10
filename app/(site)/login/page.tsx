"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { canAccessDashboard } from "@/lib/auth-cookie";

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const redirectTo = searchParams.get("redirect") || "/";
  const needsDashboardAccess = redirectTo.startsWith("/dashboard");

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
    if (!user) return;
    if (needsDashboardAccess && !canAccessDashboard(user)) return;
    router.replace(redirectTo);
    router.refresh();
  }, [user, router, redirectTo, needsDashboardAccess]);

  const signedInWithoutDashboardAccess = needsDashboardAccess && user && !canAccessDashboard(user);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {needsDashboardAccess
            ? "Restricted to owner, admin, and staff accounts."
            : "Welcome back to Clozy."}
        </p>
      </div>

      {signedInWithoutDashboardAccess ? (
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

      {!needsDashboardAccess && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}
