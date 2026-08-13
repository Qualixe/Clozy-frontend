"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Can } from "@/components/can";
import { DiscountDialog, type Discount } from "@/components/dashboard/discount-dialog";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

function typeLabel(discount: Discount): string {
  switch (discount.type) {
    case "percentage":
      return `${discount.value}% off`;
    case "fixed":
      return `${formatCurrency(discount.value)} off`;
    case "free_shipping":
      return "Free shipping";
    case "bogo":
      return `Buy ${discount.buyQty}, get ${discount.getQty} free`;
  }
}

export function DiscountsTable({ discounts }: { discounts: Discount[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Discount | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const filtered = discounts.filter((d) =>
    d.code.toLowerCase().includes(query.toLowerCase())
  );

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discounts/${pendingDelete.id}`,
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
        err instanceof Error ? err.message : "Could not delete discount."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search codes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Can permission="create_discounts">
          <DiscountDialog />
        </Can>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Minimum</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium text-foreground">
                  {discount.code}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {typeLabel(discount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {discount.minSubtotal != null ? formatCurrency(discount.minSubtotal) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {discount.usedCount}
                  {discount.usageLimit != null ? ` / ${discount.usageLimit}` : ""}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      discount.active
                        ? "bg-foreground text-background"
                        : undefined
                    }
                  >
                    {discount.active ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Can permission="edit_discounts">
                    <div className="flex items-center justify-end gap-1">
                      <DiscountDialog
                        discount={discount}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${discount.code}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${discount.code}`}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(discount);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Can>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No discount codes match your search.
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
            <AlertDialogTitle>Delete discount code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pendingDelete?.code}&quot;?
              This can&apos;t be undone.
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

export default DiscountsTable;
