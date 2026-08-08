"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type PickerCategory = {
  id: string;
  name: string;
  image: string | null;
};

/**
 * Searchable "add categories" picker over the full catalog, excluding
 * whatever's passed in `excludeIds`. Mirrors `ProductPickerDialog`.
 */
export function CategoryPickerDialog({
  open,
  onOpenChange,
  excludeIds,
  onAdd,
  description = "Choose categories to add.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  onAdd: (categories: PickerCategory[]) => void;
  description?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [allCategories, setAllCategories] = React.useState<PickerCategory[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Reset for a fresh load exactly on the closed→open transition, adjusted
  // during render rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(new Set());
      setStatus("loading");
    }
  }

  React.useEffect(() => {
    if (!open) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: PickerCategory[]) => {
        setAllCategories(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [open]);

  const excludeSet = React.useMemo(() => new Set(excludeIds), [excludeIds]);
  const candidates = allCategories.filter(
    (c) => !excludeSet.has(c.id) && c.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onAdd(allCategories.filter((c) => selected.has(c.id)));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add categories</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
          {status === "loading" && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          )}
          {status === "error" && (
            <p className="p-4 text-center text-sm text-destructive">
              Could not load categories.
            </p>
          )}
          {status === "ready" && candidates.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No matching categories.
            </p>
          )}
          {status === "ready" &&
            candidates.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-3 border-b border-border p-2 text-sm last:border-b-0 hover:bg-muted"
              >
                <Checkbox
                  checked={selected.has(category.id)}
                  onCheckedChange={() => toggle(category.id)}
                />
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1 truncate">{category.name}</span>
              </label>
            ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selected.size === 0}>
            Add {selected.size > 0 ? selected.size : ""} categor
            {selected.size === 1 ? "y" : "ies"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryPickerDialog;
