"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Truck, ShieldCheck } from "lucide-react";

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
import { useCart } from "@/lib/cart-context";
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

type AppliedDiscount = {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number | null;
  amountOff: number;
  freeShipping: boolean;
};

const PHONE_PATTERN = /^01[3-9]\d{8}$/;

function validate(form: FormState, phoneVerified: boolean) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = "Enter a valid 11-digit BD phone number (e.g. 017XXXXXXXX).";
  } else if (!phoneVerified) {
    errors.phone = "Please verify your phone number before placing the order.";
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.district) errors.district = "Select a district.";
  if (form.paymentMethod === "bkash" && !PHONE_PATTERN.test(form.bkashNumber.trim())) {
    errors.bkashNumber = "Enter the bKash number you'll pay from.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CheckoutPage() {
  const { items, clear } = useCart();
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = React.useState("");

  const [discountCode, setDiscountCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] =
    React.useState<AppliedDiscount | null>(null);
  const [applyingDiscount, setApplyingDiscount] = React.useState(false);
  const [discountError, setDiscountError] = React.useState<string | null>(null);

  // Phone OTP — fake-order protection. Verification is tied to the exact
  // phone value it was requested for; editing the number afterward voids it
  // (see updateField below).
  const [verifiedPhone, setVerifiedPhone] = React.useState<string | null>(null);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [verifyingOtp, setVerifyingOtp] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const phoneVerified = verifiedPhone !== null && verifiedPhone === form.phone.trim();

  async function sendOtp() {
    const phone = form.phone.trim();
    if (!PHONE_PATTERN.test(phone)) return;

    setSendingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/phone/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Could not send a verification code.");
      setOtpSent(true);
      setOtpCode("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Could not send a verification code.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    const phone = form.phone.trim();
    if (otpCode.trim().length !== 6) return;

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/phone/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode.trim() }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Incorrect code.");
      setVerifiedPhone(phone);
      setOtpSent(false);
      setErrors((e) => ({ ...e, phone: undefined }));
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Incorrect code.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = getShippingCost(form.district);
  const effectiveShipping = appliedDiscount?.freeShipping ? 0 : shippingCost;
  const discountAmount = appliedDiscount?.amountOff ?? 0;
  const total = Math.max(0, subtotal + effectiveShipping - discountAmount);

  async function applyDiscount() {
    if (!discountCode.trim()) return;

    setApplyingDiscount(true);
    setDiscountError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim(), subtotal }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "That discount code isn't valid.");
      }

      setAppliedDiscount(body as AppliedDiscount);
    } catch (err) {
      setAppliedDiscount(null);
      setDiscountError(
        err instanceof Error ? err.message : "That discount code isn't valid."
      );
    } finally {
      setApplyingDiscount(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    // A changed number needs its own fresh code — the OTP box (and any
    // error) belonged to whatever number was previously typed.
    if (key === "phone") {
      setOtpSent(false);
      setOtpCode("");
      setOtpError(null);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const validationErrors = validate(form, phoneVerified);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          district: form.district,
          paymentMethod: form.paymentMethod,
          bkashNumber: form.paymentMethod === "bkash" ? form.bkashNumber : null,
          shippingCost,
          discountCode: appliedDiscount?.code,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            variant: item.variant ?? null,
            image: item.image,
            price: item.price,
            qty: item.qty,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      const order = await res.json();
      setConfirmedOrderNumber(order.orderNumber ?? "");
      setConfirmedTotal(total);
      setOrderPlaced(true);
      clear();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not place order."
      );
    } finally {
      setSubmitting(false);
    }
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
          Total paid: ${confirmedTotal}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/shop">Continue Shopping</Link>}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/track-order?order=${encodeURIComponent(confirmedOrderNumber)}&contact=${encodeURIComponent(form.email)}`}
              >
                Track Your Order
              </Link>
            }
          />
        </div>
      </main>
    );
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
                  <div className="flex gap-2">
                    <div className="flex flex-1 items-stretch">
                      <span className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        +880
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        aria-invalid={!!errors.phone}
                        className="rounded-l-none"
                      />
                    </div>
                    {phoneVerified ? (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        disabled={!PHONE_PATTERN.test(form.phone.trim()) || sendingOtp}
                        onClick={sendOtp}
                      >
                        {sendingOtp ? "Sending…" : otpSent ? "Resend code" : "Verify"}
                      </Button>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}

                  {otpSent && !phoneVerified && (
                    <div className="flex gap-2 pt-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0"
                        disabled={otpCode.trim().length !== 6 || verifyingOtp}
                        onClick={verifyOtp}
                      >
                        {verifyingOtp ? "Checking…" : "Confirm"}
                      </Button>
                    </div>
                  )}
                  {otpError && (
                    <p className="text-xs text-destructive">{otpError}</p>
                  )}
                  {otpSent && !phoneVerified && !otpError && (
                    <p className="text-xs text-muted-foreground">
                      We sent a 6-digit code to {form.phone.trim()}.
                    </p>
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
                  <div className="flex items-stretch">
                    <span className="flex shrink-0 items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      +880
                    </span>
                    <Input
                      id="bkashNumber"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={form.bkashNumber}
                      onChange={(e) => updateField("bkashNumber", e.target.value)}
                      aria-invalid={!!errors.bkashNumber}
                      className="rounded-l-none"
                    />
                  </div>
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
                <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div>
                      <span className="text-foreground">{item.name}</span>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant}
                        </p>
                      )}
                      <span className="block text-xs text-muted-foreground">
                        ×{item.qty}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      ${item.price * item.qty}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            {appliedDiscount ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    {appliedDiscount.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appliedDiscount.freeShipping
                      ? "Free shipping applied"
                      : appliedDiscount.type === "percentage"
                        ? `${appliedDiscount.value}% off applied`
                        : `$${appliedDiscount.value} off applied`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="discountCode">Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="discountCode"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountError(null);
                    }}
                    aria-invalid={!!discountError}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={applyingDiscount || !discountCode.trim()}
                    onClick={applyDiscount}
                  >
                    {applyingDiscount ? "Checking…" : "Apply"}
                  </Button>
                </div>
                {discountError && (
                  <p className="text-xs text-destructive">{discountError}</p>
                )}
              </div>
            )}

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {appliedDiscount?.freeShipping && form.district ? (
                    <>
                      <span className="mr-1.5 text-muted-foreground line-through">
                        ${shippingCost}
                      </span>
                      $0
                    </>
                  ) : form.district ? (
                    `$${effectiveShipping}`
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-foreground">-${discountAmount}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>${total}</span>
            </div>

            {submitError && (
              <p className="mt-3 text-sm text-destructive">{submitError}</p>
            )}

            <Button
              type="submit"
              className="mt-3 w-full"
              disabled={submitting || !phoneVerified}
            >
              {submitting
                ? "Placing order…"
                : !phoneVerified
                  ? "Verify your phone to continue"
                  : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CheckoutPage;
