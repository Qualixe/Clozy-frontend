"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { MENU_ICONS, MENU_ICON_KEYS } from "@/lib/menu-icons";

export type DisplayStyle = "link" | "dropdown" | "megamenu";

export type MenuItemNode = {
  id: string;
  label: string;
  type: "custom" | "collection";
  url: string;
  displayStyle: DisplayStyle;
  /** Only meaningful on a megamenu's column-group items. */
  icon: string | null;
  children: MenuItemNode[];
};

export type MenuDetail = {
  id: string;
  name: string;
  handle: string;
  itemCount: number;
  items: MenuItemNode[];
};

type Category = { id: string; name: string; slug: string };

type ItemForm = {
  key: string;
  label: string;
  type: "custom" | "collection";
  url: string;
  /** Only meaningful on top-level items — controls how children render. */
  displayStyle: DisplayStyle;
  /** Only meaningful on a megamenu's column-group items. */
  icon: string;
  children: ItemForm[];
};

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `item-${keyCounter}`;
}

function fromNode(node: MenuItemNode): ItemForm {
  return {
    key: nextKey(),
    label: node.label,
    type: node.type,
    url: node.url,
    displayStyle: node.displayStyle ?? "link",
    icon: node.icon ?? "",
    children: node.children.map(fromNode),
  };
}

function emptyItem(): ItemForm {
  return {
    key: nextKey(),
    label: "",
    type: "custom",
    url: "",
    displayStyle: "link",
    icon: "",
    children: [],
  };
}

function toPayload(item: ItemForm): unknown {
  return {
    label: item.label,
    type: item.type,
    url: item.url,
    displayStyle: item.displayStyle,
    icon: item.icon || null,
    children: item.children.map(toPayload),
  };
}

function move<T>(arr: T[], index: number, delta: number): T[] {
  const next = [...arr];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Label + link-type + URL fields for a leaf navigation item. */
function LinkFields({
  item,
  categories,
  onChange,
}: {
  item: ItemForm;
  categories: Category[];
  onChange: (patch: Partial<ItemForm>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
      <Input
        placeholder="Label (e.g. Shop)"
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />

      <Select
        value={item.type}
        onValueChange={(value) => {
          if (!value) return;
          if (value === "custom") {
            onChange({ type: "custom", url: item.type === "collection" ? "" : item.url });
          } else {
            onChange({ type: "collection" });
          }
        }}
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom URL</SelectItem>
          <SelectItem value="collection">Collection</SelectItem>
        </SelectContent>
      </Select>

      {item.type === "custom" ? (
        <Input
          placeholder="/about-us"
          value={item.url}
          onChange={(e) => onChange({ url: e.target.value })}
          className="sm:col-span-1"
        />
      ) : (
        <Select
          value={item.url.replace(/^\/collections\//, "")}
          onValueChange={(slug) => {
            if (!slug) return;
            const category = categories.find((c) => c.slug === slug);
            onChange({
              url: `/collections/${slug}`,
              label: item.label || category?.name || item.label,
            });
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/** Label + icon fields for a mega-menu column-group header (not itself a link). */
function GroupFields({
  item,
  onChange,
}: {
  item: ItemForm;
  onChange: (patch: Partial<ItemForm>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
      <Input
        placeholder="Column heading (e.g. Clothing)"
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />

      <Select
        value={item.icon}
        onValueChange={(value) => {
          if (value !== null) onChange({ icon: value });
        }}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Icon" />
        </SelectTrigger>
        <SelectContent>
          {MENU_ICON_KEYS.map((key) => {
            const Icon = MENU_ICONS[key];
            return (
              <SelectItem key={key} value={key}>
                <Icon className="h-3.5 w-3.5" />
                {key}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MenuEditor({
  menu,
  categories,
}: {
  menu: MenuDetail;
  categories: Category[];
}) {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = React.useState(menu.name);
  const [items, setItems] = React.useState<ItemForm[]>(() =>
    menu.items.map(fromNode)
  );
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
    setSaved(false);
  }

  function updateChild(parentIndex: number, childIndex: number, patch: Partial<ItemForm>) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children.map((child, j) =>
                j === childIndex ? { ...child, ...patch } : child
              ),
            }
          : item
      )
    );
    setSaved(false);
  }

  function updateGrandchild(
    parentIndex: number,
    childIndex: number,
    grandchildIndex: number,
    patch: Partial<ItemForm>
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children.map((child, j) =>
                j === childIndex
                  ? {
                      ...child,
                      children: child.children.map((grandchild, k) =>
                        k === grandchildIndex ? { ...grandchild, ...patch } : grandchild
                      ),
                    }
                  : child
              ),
            }
          : item
      )
    );
    setSaved(false);
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
    setSaved(false);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
    setSaved(false);
  }

  function moveItem(index: number, delta: number) {
    setItems((current) => move(current, index, delta));
    setSaved(false);
  }

  function addChild(parentIndex: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? { ...item, children: [...item.children, emptyItem()] }
          : item
      )
    );
    setSaved(false);
  }

  function removeChild(parentIndex: number, childIndex: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? { ...item, children: item.children.filter((_, j) => j !== childIndex) }
          : item
      )
    );
    setSaved(false);
  }

  function moveChild(parentIndex: number, childIndex: number, delta: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? { ...item, children: move(item.children, childIndex, delta) }
          : item
      )
    );
    setSaved(false);
  }

  function addGrandchild(parentIndex: number, childIndex: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children.map((child, j) =>
                j === childIndex
                  ? { ...child, children: [...child.children, emptyItem()] }
                  : child
              ),
            }
          : item
      )
    );
    setSaved(false);
  }

  function removeGrandchild(parentIndex: number, childIndex: number, grandchildIndex: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children.map((child, j) =>
                j === childIndex
                  ? {
                      ...child,
                      children: child.children.filter((_, k) => k !== grandchildIndex),
                    }
                  : child
              ),
            }
          : item
      )
    );
    setSaved(false);
  }

  function moveGrandchild(
    parentIndex: number,
    childIndex: number,
    grandchildIndex: number,
    delta: number
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children.map((child, j) =>
                j === childIndex
                  ? { ...child, children: move(child.children, grandchildIndex, delta) }
                  : child
              ),
            }
          : item
      )
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/${menu.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          items: items.map(toPayload),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save menu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="menu-name">Menu name</Label>
        <Input
          id="menu-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Menu items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Button>
        </div>

        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No items yet. Add one to get started.
          </p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => {
            const isMegamenu = item.displayStyle === "megamenu";

            return (
              <div key={item.key} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 1)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <LinkFields
                      item={item}
                      categories={categories}
                      onChange={(patch) => updateItem(index, patch)}
                    />
                    {item.children.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-normal text-muted-foreground">
                          Sub-items display as
                        </Label>
                        <Select
                          value={item.displayStyle}
                          onValueChange={(value) => {
                            if (value) updateItem(index, { displayStyle: value as DisplayStyle });
                          }}
                        >
                          <SelectTrigger size="sm" className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dropdown">Simple dropdown</SelectItem>
                            <SelectItem value="megamenu">Mega-menu (columns)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sub-items */}
                <div className="mt-3 ml-8 space-y-3 border-l border-border pl-4">
                  {item.children.map((child, childIndex) =>
                    isMegamenu ? (
                      // Column group: label + icon, plus its own leaf links.
                      <div
                        key={child.key}
                        className="space-y-2 rounded-md border border-dashed border-border p-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-0.5 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Move up"
                              disabled={childIndex === 0}
                              onClick={() => moveChild(index, childIndex, -1)}
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Move down"
                              disabled={childIndex === item.children.length - 1}
                              onClick={() => moveChild(index, childIndex, 1)}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="flex-1">
                            <GroupFields
                              item={child}
                              onChange={(patch) => updateChild(index, childIndex, patch)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove column"
                            onClick={() => removeChild(index, childIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Leaf links within this column */}
                        <div className="ml-8 space-y-2 border-l border-border pl-4">
                          {child.children.map((grandchild, grandchildIndex) => (
                            <div key={grandchild.key} className="flex items-start gap-2">
                              <div className="flex flex-col gap-0.5 pt-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Move up"
                                  disabled={grandchildIndex === 0}
                                  onClick={() =>
                                    moveGrandchild(index, childIndex, grandchildIndex, -1)
                                  }
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Move down"
                                  disabled={grandchildIndex === child.children.length - 1}
                                  onClick={() =>
                                    moveGrandchild(index, childIndex, grandchildIndex, 1)
                                  }
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              <div className="flex-1">
                                <LinkFields
                                  item={grandchild}
                                  categories={categories}
                                  onChange={(patch) =>
                                    updateGrandchild(index, childIndex, grandchildIndex, patch)
                                  }
                                />
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Remove link"
                                onClick={() =>
                                  removeGrandchild(index, childIndex, grandchildIndex)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => addGrandchild(index, childIndex)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add link
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Simple dropdown: a flat leaf link.
                      <div key={child.key} className="flex items-start gap-2">
                        <div className="flex flex-col gap-0.5 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Move up"
                            disabled={childIndex === 0}
                            onClick={() => moveChild(index, childIndex, -1)}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Move down"
                            disabled={childIndex === item.children.length - 1}
                            onClick={() => moveChild(index, childIndex, 1)}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <LinkFields
                            item={child}
                            categories={categories}
                            onChange={(patch) => updateChild(index, childIndex, patch)}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove sub-item"
                          onClick={() => removeChild(index, childIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => addChild(index)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {isMegamenu ? "Add column" : "Add sub-item"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Menu"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

export default MenuEditor;
