"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getMe } from "@/lib/get-me";

export default function EmailVerifiedPage() {
  return (
    <React.Suspense>
      <EmailVerifiedContent />
    </React.Suspense>
  );
}

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const { token, updateUser } = useAuth();
  const hasError = searchParams.get("error") === "invalid";

  React.useEffect(() => {
    // Reflect the now-verified status immediately if this browser tab is
    // still signed in, rather than requiring a re-login to see it.
    if (!hasError && token) {
      getMe(token).then(updateUser).catch(() => {});
    }
    // Only ever run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      {hasError ? (
        <>
          <XCircle className="h-10 w-10 text-destructive" />
          <h1 className="text-xl font-semibold text-foreground">
            Verification link invalid
          </h1>
          <p className="text-sm text-muted-foreground">
            This link may have expired. Sign in and request a new one from
            your account page.
          </p>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-10 w-10 text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            Email verified
          </h1>
          <p className="text-sm text-muted-foreground">
            Your email has been confirmed.
          </p>
        </>
      )}
      <Button
        className="mt-2"
        nativeButton={false}
        render={<Link href="/account">Go to your account</Link>}
      />
    </div>
  );
}
