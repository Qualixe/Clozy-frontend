"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Truck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INITIAL_CART_ITEMS } from "@/data/cart-items";
import districts from "@/data/districts.json";

// ---------------------------------------------------------------------------
// Shipping
// ---------------------------------------------------------------------------

const INSIDE_DHAKA_SHIPPING = 3;
const OUTSIDE_DHAKA_SHIPPING = 6;

function getShippingCost(district: string) {
  if (!district) return 0;
  return district === "Dhaka" ? INSIDE_DHAKA_SHIPPING : OUTSIDE_DHAKA_SHIPPING;
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  paymentMethod: "cod" | "bkash";
  bkashNumber: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  paymentMethod: "cod",
  bkashNumber: "",
};

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 11-digit BD phone number (e.g. 017XXXXXXXX).";
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.district) errors.district = "Select a district.";
  if (form.paymentMethod === "bkash" && !/^01[3-9]\d{8}$/.test(form.bkashNumber.trim())) {
    errors.bkashNumber = "Enter the bKash number you'll pay from.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CheckoutPage() {
  const [items] = React.useState(INITIAL_CART_ITEMS);
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [orderPlaced, setOrderPlaced] = React.useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = getShippingCost(form.district);
  const total = subtotal + shippingCost;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    // No orders API yet — simulate placing the order.
    setTimeout(() => {
      setSubmitting(false);
      setOrderPlaced(true);
    }, 600);
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Your cart is empty
        </h1>
        <p className="text-sm text-muted-foreground">
          Add something to your cart before checking out.
        </p>
        <Button
          className="mt-2"
          nativeButton={false}
          render={<Link href="/shop">Continue Shopping</Link>}
        />
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
        <h1 className="text-2xl font-semibold text-foreground">
          Order placed successfully
        </h1>
        <p className="text-sm text-muted-foreground">
          Thanks, {form.name.split(" ")[0]}. We'll call you at {form.phone} to
          confirm your order.{" "}
          {form.paymentMethod === "cod"
            ? "Pay in cash when it arrives."
            : "We'll send a bKash payment request shortly."}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Total paid: ${total}
        </p>
        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/shop">Continue Shopping</Link>}
        />
      </main>
    );
  }

  return (
    <main className="w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Easy Checkout
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]"
        >
          {/* Form */}
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold text-foreground">
                Contact Information
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-sm font-semibold text-foreground">
                Shipping Address
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="House, road, area"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={form.district}
                    onValueChange={(value) => {
                      if (value !== null) updateField("district", value);
                    }}
                  >
                    <SelectTrigger id="district" className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && (
                    <p className="text-xs text-destructive">{errors.district}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Shipping Cost</Label>
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    {form.district ? (
                      <span className="text-foreground">
                        ${shippingCost}{" "}
                        <span className="text-muted-foreground">
                          ({form.district === "Dhaka" ? "Inside" : "Outside"}{" "}
                          Dhaka)
                        </span>
                      </span>
                    ) : (
                      "Select a district"
                    )}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-sm font-semibold text-foreground">
                Payment Method
              </h2>
              <RadioGroup
                className="mt-4"
                value={form.paymentMethod}
                onValueChange={(value) =>
                  updateField("paymentMethod", value as FormState["paymentMethod"])
                }
              >
                <Label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-data-checked:border-foreground">
                  <RadioGroupItem value="cod" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      Cash on Delivery
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Pay with cash when your order arrives.
                    </span>
                  </span>
                </Label>

                <Label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-data-checked:border-foreground">
                  <RadioGroupItem value="bkash" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      bKash
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Pay instantly with your bKash account.
                    </span>
                  </span>
                </Label>
              </RadioGroup>

              {form.paymentMethod === "bkash" && (
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="bkashNumber">Your bKash Number</Label>
                  <Input
                    id="bkashNumber"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.bkashNumber}
                    onChange={(e) => updateField("bkashNumber", e.target.value)}
                    aria-invalid={!!errors.bkashNumber}
                  />
                  {errors.bkashNumber ? (
                    <p className="text-xs text-destructive">
                      {errors.bkashNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      We'll send a payment request to this number after you
                      place the order.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-xl border border-border p-5 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold text-foreground">
              Order Summary
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-foreground">
                    {item.name}{" "}
                    <span className="text-muted-foreground">×{item.qty}</span>
                  </span>
                  <span className="font-medium text-foreground">
                    ${item.price * item.qty}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {form.district ? `$${shippingCost}` : "—"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>${total}</span>
            </div>

            <Button type="submit" className="mt-5 w-full" disabled={submitting}>
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CheckoutPage;
