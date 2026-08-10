"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

/** Gates a storefront page behind being signed in (and, by default, a verified email) — the Account section. */
export function RequireAuth({
  children,
  requireVerified = true,
}: {
  children: React.ReactNode;
  requireVerified?: boolean;
}) {
  const { user, ready, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  React.useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, pathname, router]);

  async function handleResend() {
    if (!token) return;
    setResending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/verification-notification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setResent(true);
    } finally {
      setResending(false);
    }
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requireVerified && !user.emailVerified) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <MailWarning className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to {user.email}. Please verify it to
          access your account.
        </p>
        <Button onClick={handleResend} disabled={resending || resent} className="mt-2">
          {resent ? "Email sent" : resending ? "Sending…" : "Resend email"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireAuth;
