"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, ImageOff, GripVertical } from "lucide-react";

import { Input } from "@/components/ui/input";
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
import { CategoryDialog, type Category } from "@/components/dashboard/category-dialog";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Local, reorderable copy of the list — resynced whenever the server data
  // changes (e.g. after router.refresh() from an add/edit/delete). Adjusted
  // during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevCategories, setPrevCategories] = React.useState(categories);
  const [items, setItems] = React.useState(categories);
  if (categories !== prevCategories) {
    setPrevCategories(categories);
    setItems(categories);
  }

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [reorderError, setReorderError] = React.useState<string | null>(null);

  // Drag-and-drop reordering only makes sense against the full, unfiltered
  // list — row positions in a filtered view don't map cleanly to it.
  const canReorder = query === "";

  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  async function persistOrder(next: Category[]) {
    setReorderError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    } catch (err) {
      setReorderError(
        err instanceof Error ? err.message : "Could not save the new order."
      );
      setItems(categories);
    }
  }

  function handleDrop(targetId: string) {
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    setItems((current) => {
      const from = current.findIndex((c) => c.id === draggedId);
      const to = current.findIndex((c) => c.id === targetId);
      if (from === -1 || to === -1) return current;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      persistOrder(next);
      return next;
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${pendingDelete.id}`,
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
        err instanceof Error ? err.message : "Could not delete category."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {reorderError && (
          <p className="text-sm text-destructive">{reorderError}</p>
        )}
        {!canReorder && (
          <p className="text-xs text-muted-foreground">
            Clear the search to drag and reorder.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((category) => (
              <TableRow
                key={category.id}
                draggable={canReorder}
                onDragStart={() => setDraggedId(category.id)}
                onDragOver={(e) => {
                  if (!canReorder) return;
                  e.preventDefault();
                  if (dragOverId !== category.id) setDragOverId(category.id);
                }}
                onDragLeave={() =>
                  setDragOverId((current) => (current === category.id ? null : current))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(category.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={cn(
                  draggedId === category.id && "opacity-50",
                  dragOverId === category.id &&
                    draggedId !== category.id &&
                    "border-t-2 border-t-primary"
                )}
              >
                <TableCell className="text-muted-foreground">
                  {canReorder && (
                    <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {category.description || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {category.productCount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <CategoryDialog
                      category={category}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(category);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No categories match your search.
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
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pendingDelete?.name}"?{" "}
              {pendingDelete && pendingDelete.productCount > 0
                ? `${pendingDelete.productCount} product${pendingDelete.productCount === 1 ? "" : "s"} will be uncategorized.`
                : "This can't be undone."}
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

export default CategoriesTable;
