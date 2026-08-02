"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/dashboard/product-form";

export function ProductDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setFormKey((k) => k + 1);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your catalog.
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          key={formKey}
          onCancel={() => handleOpenChange(false)}
          onSuccess={() => {
            handleOpenChange(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ProductDialog;
