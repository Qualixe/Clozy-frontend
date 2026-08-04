"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star, Pencil, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import type { Product } from "@/components/product-card";

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const filtered = products.filter((p) =>
    (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase())
  );

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${pendingDelete.id}`,
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
        err instanceof Error ? err.message : "Could not delete product."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.category}
                </TableCell>
                <TableCell>
                  <span className="text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="ml-1.5 text-xs text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-foreground">{product.rating}</span>
                    <span>({product.reviews})</span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.tag ? (
                    <Badge
                      className={
                        product.tag === "Sale"
                          ? "bg-green-600 text-white"
                          : "bg-foreground text-background"
                      }
                    >
                      {product.tag}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${product.name}`}
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(product);
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
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No products match your search.
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
            <AlertDialogTitle>Delete product</AlertDialogTitle>
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

export default ProductsTable;
