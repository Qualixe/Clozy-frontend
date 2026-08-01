"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function ProductSort({
  value,
  onValueChange,
}: {
  value: SortValue;
  onValueChange: (value: SortValue) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as SortValue)}
    >
      <SelectTrigger size="sm" className="w-[190px] text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ProductSort;
