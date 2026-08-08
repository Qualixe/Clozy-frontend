"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, GripVertical } from "lucide-react";

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
import { FaqDialog } from "@/components/dashboard/faq-dialog";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/get-faqs";

export function FaqsTable({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [pendingDelete, setPendingDelete] = React.useState<Faq | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Local, reorderable copy — resynced whenever the server data changes
  // (e.g. after router.refresh() from an add/edit/delete). Adjusted during
  // render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevFaqs, setPrevFaqs] = React.useState(faqs);
  const [items, setItems] = React.useState(faqs);
  if (faqs !== prevFaqs) {
    setPrevFaqs(faqs);
    setItems(faqs);
  }

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [reorderError, setReorderError] = React.useState<string | null>(null);

  async function persistOrder(next: Faq[]) {
    setReorderError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: next.map((f) => f.id) }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    } catch (err) {
      setReorderError(
        err instanceof Error ? err.message : "Could not save the new order."
      );
      setItems(faqs);
    }
  }

  function handleDrop(targetId: string) {
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    setItems((current) => {
      const from = current.findIndex((f) => f.id === draggedId);
      const to = current.findIndex((f) => f.id === targetId);
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
        `${process.env.NEXT_PUBLIC_API_URL}/faqs/${pendingDelete.id}`,
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
        err instanceof Error ? err.message : "Could not delete FAQ."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No FAQs yet. Add one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reorderError && <p className="text-sm text-destructive">{reorderError}</p>}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((faq) => (
              <TableRow
                key={faq.id}
                draggable
                onDragStart={() => setDraggedId(faq.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverId !== faq.id) setDragOverId(faq.id);
                }}
                onDragLeave={() =>
                  setDragOverId((current) => (current === faq.id ? null : current))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(faq.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={cn(
                  draggedId === faq.id && "opacity-50",
                  dragOverId === faq.id &&
                    draggedId !== faq.id &&
                    "border-t-2 border-t-primary"
                )}
              >
                <TableCell className="text-muted-foreground">
                  <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
                </TableCell>
                <TableCell className="max-w-md truncate font-medium text-foreground">
                  {faq.question}
                </TableCell>
                <TableCell>
                  <Badge variant={faq.status === "published" ? "default" : "secondary"}>
                    {faq.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <FaqDialog
                      faq={faq}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit "${faq.question}"`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete "${faq.question}"`}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(faq);
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
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pendingDelete?.question}&quot;?
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

export default FaqsTable;
