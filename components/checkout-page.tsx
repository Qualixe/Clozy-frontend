"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  HandCoins,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

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
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import districts from "@/data/districts.json";
import type { Order, OrderDetail } from "@/data/orders";

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

type PaymentMethod = "cod" | "bkash" | "bkash_shipping_advance" | "bkash_partial_advance";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  paymentMethod: PaymentMethod;
};

const INITIAL_FORM: Omit<FormState, "paymentMethod"> = {
  name: "",
  phone: "",
  email: "",
  address: "",
  district: "",
};

type AppliedDiscount = {
  code: string;
  type: "percentage" | "fixed" | "free_shipping" | "bogo";
  value: number | null;
  buyQty: number | null;
  getQty: number | null;
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

  return errors;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CheckoutPage({
  insideDhakaRate = 3,
  outsideDhakaRate = 6,
  codEnabled = true,
  bkashGatewayEnabled = false,
  bkashShippingAdvanceEnabled = false,
  bkashPartialAdvanceEnabled = false,
  bkashPartialAdvanceMode = "percentage",
  bkashPartialAdvancePercent = 20,
  bkashPartialAdvanceFixedAmount = null,
}: {
  insideDhakaRate?: number;
  outsideDhakaRate?: number;
  codEnabled?: boolean;
  bkashGatewayEnabled?: boolean;
  bkashShippingAdvanceEnabled?: boolean;
  bkashPartialAdvanceEnabled?: boolean;
  bkashPartialAdvanceMode?: "percentage" | "fixed";
  bkashPartialAdvancePercent?: number;
  bkashPartialAdvanceFixedAmount?: number | null;
} = {}) {
  const { items, clear } = useCart();
  const { user, token, ready } = useAuth();
  // First enabled method wins as the default — cod is usually on, but a
  // store that's gone bKash-only shouldn't default to an unavailable option.
  const defaultPaymentMethod: PaymentMethod = codEnabled
    ? "cod"
    : bkashGatewayEnabled
      ? "bkash"
      : bkashShippingAdvanceEnabled
        ? "bkash_shipping_advance"
        : bkashPartialAdvanceEnabled
          ? "bkash_partial_advance"
          : "cod";
  const [form, setForm] = React.useState<FormState>(() => ({
    ...INITIAL_FORM,
    paymentMethod: defaultPaymentMethod,
  }));
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = React.useState("");
  const [orderIdCopied, setOrderIdCopied] = React.useState(false);

  function copyOrderId() {
    navigator.clipboard.writeText(confirmedOrderNumber).then(() => {
      setOrderIdCopied(true);
      setTimeout(() => setOrderIdCopied(false), 1500);
    });
  }

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
  // A logged-in customer whose account phone is already verified shouldn't
  // have to redo the OTP dance — unless they've typed in a different number.
  const accountPhoneVerified =
    !!user?.phoneVerified && !!user.phone && user.phone === form.phone.trim();
  const phoneVerified =
    accountPhoneVerified || (verifiedPhone !== null && verifiedPhone === form.phone.trim());

  // Auto-fill for a logged-in customer: name/email come straight off the
  // account, phone/address/district (not stored on the account itself —
  // see auth-context's AuthUser shape) come from their most recent order,
  // if they have one. Only ever fills fields the customer hasn't already
  // typed into, and only runs once per visit.
  const autofilledRef = React.useRef(false);
  React.useEffect(() => {
    if (!ready || !user || !token || autofilledRef.current) return;
    autofilledRef.current = true;

    setForm((f) => ({
      ...f,
      name: f.name || user.name,
      email: f.email || user.email,
    }));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/orders`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((orders: Order[] | null) => {
        const mostRecent = orders?.[0];
        if (!mostRecent) return null;
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/orders/${mostRecent.id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }).then((res) => (res.ok ? (res.json() as Promise<OrderDetail>) : null));
      })
      .then((detail) => {
        if (!detail) return;
        setForm((f) => ({
          ...f,
          phone: f.phone || detail.phone || "",
          address: f.address || detail.address || "",
          district: f.district || detail.district || "",
        }));
      })
      .catch(() => {
        // Best-effort — the customer can still fill the form in by hand.
      });
  }, [ready, user, token]);

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
  const shippingCost = form.district
    ? form.district === "Dhaka"
      ? insideDhakaRate
      : outsideDhakaRate
    : 0;
  const effectiveShipping = appliedDiscount?.freeShipping ? 0 : shippingCost;
  const discountAmount = appliedDiscount?.amountOff ?? 0;
  const total = Math.max(0, subtotal + effectiveShipping - discountAmount);

  // Previews only — the backend recomputes these authoritatively at order
  // creation, so a stale/tampered value here can't change what's charged.
  const shippingAdvanceAmount = Math.round(effectiveShipping * 100) / 100;
  // The advance is the full shipping fee plus a portion of the product
  // price — not a percentage of the whole order — so shipping is always
  // covered upfront and the rest of the product price is COD.
  const partialAdvanceProductPortion =
    bkashPartialAdvanceMode === "fixed"
      ? (bkashPartialAdvanceFixedAmount ?? 0)
      : Math.round(subtotal * bkashPartialAdvancePercent) / 100;
  const partialAdvanceAmount = Math.min(
    effectiveShipping + partialAdvanceProductPortion,
    total
  );

  const advanceAmountForMethod: Partial<Record<PaymentMethod, number>> = {
    bkash: total,
    bkash_shipping_advance: shippingAdvanceAmount,
    bkash_partial_advance: partialAdvanceAmount,
  };
  const currentAdvanceAmount = advanceAmountForMethod[form.paymentMethod] ?? 0;
  const codDueNow = Math.max(0, total - currentAdvanceAmount);
  const isHybridMethod =
    form.paymentMethod === "bkash_shipping_advance" ||
    form.paymentMethod === "bkash_partial_advance";

  // All three cash-collected-on-arrival methods present as "Cash on
  // Delivery" — the badge is what actually distinguishes them, since from
  // the customer's perspective they're still paying the rest in cash.
  const partialAdvanceLabel =
    bkashPartialAdvanceMode === "percentage"
      ? `${bkashPartialAdvancePercent}%`
      : formatCurrency(partialAdvanceProductPortion);
  const partialAdvanceDescription =
    bkashPartialAdvanceMode === "percentage"
      ? `Pay shipping fee + ${bkashPartialAdvancePercent}% of product price via bKash, rest on delivery.`
      : `Pay shipping fee + ${formatCurrency(partialAdvanceProductPortion)} via bKash, rest on delivery.`;

  const paymentOptions: {
    value: PaymentMethod;
    title: string;
    description: string;
    icon: LucideIcon;
    iconSrc?: string;
    tint: "amber" | "pink";
  }[] = [
    ...(codEnabled
      ? [
          {
            value: "cod" as const,
            title: "Cash on Delivery",
            description: "Pay with cash when your order arrives.",
            icon: HandCoins,
            iconSrc: "/cod.svg",
            tint: "amber" as const,
          },
        ]
      : []),
    ...(bkashGatewayEnabled
      ? [
          {
            value: "bkash" as const,
            title: "bKash",
            description: "Pay instantly with your bKash account.",
            icon: Smartphone,
            iconSrc: "/bkash-icon.png",
            tint: "pink" as const,
          },
        ]
      : []),
    ...(bkashShippingAdvanceEnabled
      ? [
          {
            value: "bkash_shipping_advance" as const,
            title: "COD + Shipping Fee",
            description: "Pay shipping via bKash, rest on delivery.",
            icon: HandCoins,
            iconSrc: "/cod.svg",
            tint: "amber" as const,
          },
        ]
      : []),
    ...(bkashPartialAdvanceEnabled
      ? [
          {
            value: "bkash_partial_advance" as const,
            title: `COD + ${partialAdvanceLabel} Advance`,
            description: partialAdvanceDescription,
            icon: HandCoins,
            iconSrc: "/cod.svg",
            tint: "amber" as const,
          },
        ]
      : []),
  ];

  const TINT_STYLES: Record<
    "amber" | "pink",
    { icon: string; border: string; bg: string; check: string }
  > = {
    amber: {
      icon: "bg-amber-400 text-white",
      border: "has-data-checked:border-amber-400",
      bg: "has-data-checked:bg-amber-50 dark:has-data-checked:bg-amber-400/10",
      check: "bg-amber-400",
    },
    pink: {
      icon: "bg-[#E2136E] text-white",
      border: "has-data-checked:border-[#E2136E]",
      bg: "has-data-checked:bg-pink-50 dark:has-data-checked:bg-[#E2136E]/10",
      check: "bg-[#E2136E]",
    },
  };

  async function applyDiscount() {
    if (!discountCode.trim()) return;

    setApplyingDiscount(true);
    setDiscountError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          subtotal,
          items: items.map((item) => ({ price: item.price, qty: item.qty })),
        }),
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

      // The backend decides authoritatively whether this order has
      // something due online right now — true for full bKash, and for the
      // two hybrid methods only when their computed advance is > 0 (e.g. a
      // free-shipping discount can zero out the shipping-advance amount).
      if (order.paymentStatus === "pending") {
        const paymentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/bkash/create-payment`,
          { method: "POST" }
        );
        const paymentBody = await paymentRes.json().catch(() => null);
        if (!paymentRes.ok) {
          throw new Error(paymentBody?.message ?? "Could not start bKash payment.");
        }

        clear();
        window.location.href = paymentBody.bkashUrl;
        return;
      }

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
          confirm your order. Pay in cash when it arrives.
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {confirmedOrderNumber}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label="Copy order ID"
            onClick={copyOrderId}
          >
            {orderIdCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <p className="text-xs text-amber-800 dark:text-amber-400">
            Please save this order ID — you'll need it along with your email
            to track your order later.
          </p>
        </div>

        <p className="mt-2 text-sm font-medium text-foreground">
          Total paid: {formatCurrency(confirmedTotal)}
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
          <div >
            <section className="h-fit space-y-8 rounded-xl border border-border p-5">
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

                <div className="space-y-1.5">
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

                <div className="space-y-1.5 ">
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={form.district}
                    onValueChange={(value) => {
                      if (value !== null) updateField("district", value);
                    }}
                  >
                    <SelectTrigger id="district" className="h-(--control-height)! w-full">
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
              </div>
                            
              
            
            </section>


            <section className="h-fit space-y-5 rounded-xl border border-border p-5 mt-4">
              <h2 className="text-sm font-semibold text-foreground">
                Payment Method
              </h2>
              {paymentOptions.length === 0 ? (
                <p className="text-sm text-destructive">
                  No payment methods are available right now. Please contact
                  us to place your order.
                </p>
              ) : (
                <>
                  <RadioGroup
                    className="sm:grid-cols-2"
                    value={form.paymentMethod}
                    onValueChange={(value) =>
                      updateField("paymentMethod", value as FormState["paymentMethod"])
                    }
                  >
                    {paymentOptions.map((option) => {
                      const tint = TINT_STYLES[option.tint];
                      return (
                        <Label
                          key={option.value}
                          className={cn(
                            "group relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-border bg-background p-3.5 transition-all hover:border-foreground/25",
                            tint.border,
                            tint.bg
                          )}
                        >
                          <RadioGroupItem value={option.value} className="sr-only" />
                          {option.iconSrc ? (
                            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                              <Image
                                src={option.iconSrc}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-contain"
                              />
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                                tint.icon
                              )}
                            >
                              <option.icon className="h-5 w-5" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-sm font-semibold text-foreground">
                              {option.title}
                            </span>
                            <span className="block text-xs leading-relaxed text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "absolute -top-2 -right-2 flex h-5 w-5 scale-75 items-center justify-center rounded-full text-white opacity-0 shadow-sm transition-all group-has-data-checked:scale-100 group-has-data-checked:opacity-100",
                              tint.check
                            )}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        </Label>
                      );
                    })}
                  </RadioGroup>

                  {form.paymentMethod === "bkash" && (
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      You'll be redirected to bKash to complete your payment
                      securely after placing the order.
                    </p>
                  )}

                  {isHybridMethod && (
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      You'll be redirected to bKash to pay{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(currentAdvanceAmount)}
                      </span>{" "}
                      now — the remaining{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(codDueNow)}
                      </span>{" "}
                      is due in cash when your order arrives.
                    </p>
                  )}
                </>
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
                      {formatCurrency(item.price * item.qty)}
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
                      : appliedDiscount.type === "bogo"
                        ? `Buy ${appliedDiscount.buyQty}, get ${appliedDiscount.getQty} free applied`
                        : appliedDiscount.type === "percentage"
                          ? `${appliedDiscount.value}% off applied`
                          : `${formatCurrency(appliedDiscount.value)} off applied`}
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
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {appliedDiscount?.freeShipping && form.district ? (
                    <>
                      <span className="mr-1.5 text-muted-foreground line-through">
                        {formatCurrency(shippingCost)}
                      </span>
                      {formatCurrency(0)}
                    </>
                  ) : form.district ? (
                    formatCurrency(effectiveShipping)
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-foreground">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {isHybridMethod && currentAdvanceAmount > 0 && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pay now (bKash)</span>
                  <span className="text-foreground">
                    {formatCurrency(currentAdvanceAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due on delivery</span>
                  <span className="text-foreground">{formatCurrency(codDueNow)}</span>
                </div>
              </div>
            )}

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
