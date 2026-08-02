"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/lib/auth-context";

export type MenuSummary = {
  id: string;
  name: string;
  handle: string;
  itemCount: number;
};

export function MenusTable({ menus }: { menus: MenuSummary[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [pendingDelete, setPendingDelete] = React.useState<MenuSummary | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menus/${pendingDelete.id}`,
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
        err instanceof Error ? err.message : "Could not delete menu."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (menus.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No menus yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Handle</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell className="font-medium text-foreground">
                  <Link
                    href={`/dashboard/content/menus/${menu.id}`}
                    className="hover:underline underline-offset-4"
                  >
                    {menu.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {menu.handle}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {menu.itemCount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${menu.name}`}
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/content/menus/${menu.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${menu.name}`}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(menu);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
            <AlertDialogTitle>Delete menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pendingDelete?.name}"? This
              can't be undone.
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

export default MenusTable;
