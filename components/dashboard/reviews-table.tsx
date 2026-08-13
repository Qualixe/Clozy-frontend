"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Can } from "@/components/can";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  author: string;
  email: string | null;
  rating: number;
  body: string;
  status: ReviewStatus;
  date: string;
};

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"] as const;

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TRIGGER_STYLES: Record<ReviewStatus, string> = {
  approved: "border-transparent bg-foreground text-background",
  pending: "border-transparent bg-muted text-foreground",
  rejected: "border-transparent bg-destructive text-destructive-foreground",
};

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUS_TABS)[number]>("All");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [statusError, setStatusError] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Review | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const filtered = reviews.filter((review) => {
    if (status !== "All" && review.status !== status.toLowerCase()) return false;
    const haystack = `${review.author} ${review.productName ?? ""} ${review.body}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  async function changeStatus(review: Review, next: ReviewStatus) {
    setUpdatingId(review.id);
    setStatusError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${review.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: next }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      router.refresh();
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Could not update review status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${pendingDelete.id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete review."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {statusError && <p className="text-sm text-destructive">{statusError}</p>}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium text-foreground">
                  {review.productSlug ? (
                    <Link
                      href={`/products/${review.productSlug}`}
                      target="_blank"
                      className="hover:underline underline-offset-4"
                    >
                      {review.productName ?? "Untitled product"}
                    </Link>
                  ) : (
                    (review.productName ?? "—")
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-foreground">{review.author}</p>
                  {review.email && (
                    <p className="text-xs text-muted-foreground">{review.email}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {review.body}
                </TableCell>
                <TableCell>
                  <Can
                    permission="edit_reviews"
                    fallback={
                      <Badge
                        variant="secondary"
                        className={STATUS_TRIGGER_STYLES[review.status]}
                      >
                        {STATUS_OPTIONS.find((o) => o.value === review.status)?.label}
                      </Badge>
                    }
                  >
                    <Select
                      value={review.status}
                      disabled={updatingId === review.id}
                      onValueChange={(value) => {
                        if (value) changeStatus(review, value as ReviewStatus);
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className={cn(
                          "w-[120px]",
                          STATUS_TRIGGER_STYLES[review.status]
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Can>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {review.date}
                </TableCell>
                <TableCell>
                  <Can permission="edit_reviews">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete review by ${review.author}`}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(review);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No reviews match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by &quot;
              {pendingDelete?.author}&quot;? This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ReviewsTable;
