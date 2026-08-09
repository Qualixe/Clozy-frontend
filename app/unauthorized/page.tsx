"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-6">
        <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Access denied</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user
              ? `${user.email} doesn't have permission to view that page.`
              : "You don't have permission to view that page."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard">Back to Dashboard</Link>} />
          <Button variant="ghost" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
