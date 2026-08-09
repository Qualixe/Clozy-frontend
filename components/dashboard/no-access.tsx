import { Lock } from "lucide-react";

/**
 * Drop-in fallback for a dashboard section whose data the current user
 * isn't permitted to fetch — e.g. a page gated on one permission (like
 * Analytics) pulling in data that needs a different one (like Orders).
 * Keeps the rest of the page usable instead of crashing the whole route.
 */
export function NoAccess({
  message = "You don't have access to this section.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center">
      <Lock className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default NoAccess;
