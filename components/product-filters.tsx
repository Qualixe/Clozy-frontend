"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export type FiltersState = {
  categories: string[];
  onSaleOnly: boolean;
  newOnly: boolean;
  priceRange: [number, number];
};

export function ProductFilters({
  availableCategories,
  priceBounds,
  filters,
  onChange,
  onReset,
}: {
  availableCategories: string[];
  priceBounds: [number, number];
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}) {
  function toggleCategory(category: string, checked: boolean) {
    onChange({
      ...filters,
      categories: checked
        ? [...filters.categories, category]
        : filters.categories.filter((c) => c !== category),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-muted-foreground"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium text-foreground">Category</p>
        <div className="mt-3 space-y-2.5">
          {availableCategories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Checkbox
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) =>
                  toggleCategory(category, checked === true)
                }
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium text-foreground">Price</p>
        <div className="mt-4 px-1">
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={5}
            value={filters.priceRange}
            onValueChange={(value) =>
              onChange({
                ...filters,
                priceRange: value as [number, number],
              })
            }
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Checkbox
            checked={filters.onSaleOnly}
            onCheckedChange={(checked) =>
              onChange({ ...filters, onSaleOnly: checked === true })
            }
          />
          On Sale
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Checkbox
            checked={filters.newOnly}
            onCheckedChange={(checked) =>
              onChange({ ...filters, newOnly: checked === true })
            }
          />
          New Arrivals
        </label>
      </div>
    </div>
  );
}

export default ProductFilters;
