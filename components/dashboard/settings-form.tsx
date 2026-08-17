"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  ImageOff,
  Mail,
  MessageSquare,
  Palette,
  Sparkles,
  Store,
  Target,
  Truck,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/dashboard/media-picker-dialog";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { AdminStoreSettings } from "@/lib/get-settings";

type SettingsState = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  storeAddress: string;
  storeDescription: string;
  insideDhakaRate: number;
  outsideDhakaRate: number;
  codEnabled: boolean;
  bkashGatewayEnabled: boolean;
  bkashBaseUrl: string;
  bkashAppKey: string;
  bkashAppSecret: string;
  bkashUsername: string;
  bkashPassword: string;
  bkashShippingAdvanceEnabled: boolean;
  bkashPartialAdvanceEnabled: boolean;
  bkashPartialAdvancePercent: number;
  facebookPixelId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  tiktokPixelId: string;
  smsGatewayUrl: string;
  smsApiKey: string;
  smsSenderId: string;
  smsOrderConfirmationEnabled: boolean;
  smsOrderConfirmationTemplate: string;
  smsOrderCancelledEnabled: boolean;
  smsOrderCancelledTemplate: string;
  smsPromotionalEnabled: boolean;
  steadfastEnabled: boolean;
  steadfastApiKey: string;
  steadfastSecretKey: string;
  pathaoEnabled: boolean;
  pathaoBaseUrl: string;
  pathaoClientId: string;
  pathaoClientSecret: string;
  pathaoUsername: string;
  pathaoPassword: string;
  pathaoStoreId: string;
  anthropicApiKey: string;
  aiProvider: "anthropic" | "openai" | "gemini";
  openaiApiKey: string;
  openaiModel: string;
  geminiApiKey: string;
  geminiModel: string;
  logoUrl: string;
  faviconUrl: string;
  categoryShowcaseHeading: string;
  metaTitle: string;
  metaDescription: string;
  emailLogoUrl: string;
  emailAccentColor: string;
  emailFooterText: string;
  footerTagline: string;
  footerInstagramUrl: string;
  footerTwitterUrl: string;
  footerFacebookUrl: string;
  footerYoutubeUrl: string;
};

const TAB_VALUES = [
  "general",
  "branding",
  "shipping",
  "payment",
  "pixels",
  "sms",
  "email",
  "ai",
] as const;

const DEFAULT_ACCENT_COLOR = "#111827";
const DEFAULT_CATEGORY_SHOWCASE_HEADING = "Shop by Category";

const PATHAO_SANDBOX_URL = "https://courier-api-sandbox.pathao.com";
const PATHAO_LIVE_URL = "https://api-hermes.pathao.com";

const DEFAULT_CONFIRMATION_TEMPLATE =
  "Hi {customer_name}, your order {order_number} has been confirmed. Total: {total}. Thank you for shopping with us!";
const DEFAULT_CANCELLED_TEMPLATE =
  "Hi {customer_name}, your order {order_number} has been cancelled. Contact us if you have questions.";

// storeName/storeDescription have no backend column yet — placeholder only,
// unlike supportEmail/supportPhone/storeAddress below them, which are real.
const INITIAL_SETTINGS: Pick<SettingsState, "storeName" | "storeDescription"> = {
  storeName: "Clozy",
  storeDescription:
    "Considered essentials, made to last. Designed in-house, shipped worldwide.",
};

export function SettingsForm({
  initialSettings,
  activeTab,
}: {
  initialSettings: AdminStoreSettings;
  activeTab?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();
  const [tab, setTab] = React.useState<(typeof TAB_VALUES)[number]>(
    TAB_VALUES.includes(activeTab as (typeof TAB_VALUES)[number])
      ? (activeTab as (typeof TAB_VALUES)[number])
      : "general"
  );
  const [paymentSubTab, setPaymentSubTab] = React.useState<"method" | "credential">(
    "method"
  );
  const [settings, setSettings] = React.useState<SettingsState>({
    ...INITIAL_SETTINGS,
    insideDhakaRate: initialSettings.insideDhakaRate ?? 3,
    outsideDhakaRate: initialSettings.outsideDhakaRate ?? 6,
    codEnabled: initialSettings.codEnabled ?? true,
    supportEmail: initialSettings.supportEmail ?? "",
    supportPhone: initialSettings.supportPhone ?? "",
    storeAddress: initialSettings.storeAddress ?? "",
    facebookPixelId: initialSettings.facebookPixelId ?? "",
    googleAnalyticsId: initialSettings.googleAnalyticsId ?? "",
    googleTagManagerId: initialSettings.googleTagManagerId ?? "",
    tiktokPixelId: initialSettings.tiktokPixelId ?? "",
    smsGatewayUrl: initialSettings.smsGatewayUrl ?? "",
    smsApiKey: initialSettings.smsApiKey ?? "",
    smsSenderId: initialSettings.smsSenderId ?? "",
    smsOrderConfirmationEnabled: initialSettings.smsOrderConfirmationEnabled,
    smsOrderConfirmationTemplate:
      initialSettings.smsOrderConfirmationTemplate ?? DEFAULT_CONFIRMATION_TEMPLATE,
    smsOrderCancelledEnabled: initialSettings.smsOrderCancelledEnabled,
    smsOrderCancelledTemplate:
      initialSettings.smsOrderCancelledTemplate ?? DEFAULT_CANCELLED_TEMPLATE,
    smsPromotionalEnabled: initialSettings.smsPromotionalEnabled,
    steadfastEnabled: initialSettings.steadfastEnabled,
    steadfastApiKey: initialSettings.steadfastApiKey ?? "",
    steadfastSecretKey: initialSettings.steadfastSecretKey ?? "",
    pathaoEnabled: initialSettings.pathaoEnabled,
    pathaoBaseUrl: initialSettings.pathaoBaseUrl ?? "",
    pathaoClientId: initialSettings.pathaoClientId ?? "",
    pathaoClientSecret: initialSettings.pathaoClientSecret ?? "",
    pathaoUsername: initialSettings.pathaoUsername ?? "",
    pathaoPassword: initialSettings.pathaoPassword ?? "",
    pathaoStoreId: initialSettings.pathaoStoreId ?? "",
    bkashGatewayEnabled: initialSettings.bkashGatewayEnabled,
    bkashBaseUrl: initialSettings.bkashBaseUrl ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
    bkashAppKey: initialSettings.bkashAppKey ?? "",
    bkashAppSecret: initialSettings.bkashAppSecret ?? "",
    bkashUsername: initialSettings.bkashUsername ?? "",
    bkashPassword: initialSettings.bkashPassword ?? "",
    bkashShippingAdvanceEnabled: initialSettings.bkashShippingAdvanceEnabled,
    bkashPartialAdvanceEnabled: initialSettings.bkashPartialAdvanceEnabled,
    bkashPartialAdvancePercent: initialSettings.bkashPartialAdvancePercent ?? 20,
    anthropicApiKey: initialSettings.anthropicApiKey ?? "",
    aiProvider: initialSettings.aiProvider ?? "anthropic",
    openaiApiKey: initialSettings.openaiApiKey ?? "",
    openaiModel: initialSettings.openaiModel ?? "",
    geminiApiKey: initialSettings.geminiApiKey ?? "",
    geminiModel: initialSettings.geminiModel ?? "",
    logoUrl: initialSettings.logoUrl ?? "",
    faviconUrl: initialSettings.faviconUrl ?? "",
    categoryShowcaseHeading:
      initialSettings.categoryShowcaseHeading ?? DEFAULT_CATEGORY_SHOWCASE_HEADING,
    metaTitle: initialSettings.metaTitle ?? "",
    metaDescription: initialSettings.metaDescription ?? "",
    emailLogoUrl: initialSettings.emailLogoUrl ?? "",
    emailAccentColor: initialSettings.emailAccentColor ?? DEFAULT_ACCENT_COLOR,
    emailFooterText: initialSettings.emailFooterText ?? "",
    footerTagline: initialSettings.footerTagline ?? "",
    footerInstagramUrl: initialSettings.footerInstagramUrl ?? "",
    footerTwitterUrl: initialSettings.footerTwitterUrl ?? "",
    footerFacebookUrl: initialSettings.footerFacebookUrl ?? "",
    footerYoutubeUrl: initialSettings.footerYoutubeUrl ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = React.useState(false);
  const [faviconPickerOpen, setFaviconPickerOpen] = React.useState(false);
  const [emailLogoPickerOpen, setEmailLogoPickerOpen] = React.useState(false);
  const [pathaoStores, setPathaoStores] = React.useState<
    { storeId: number; storeName: string }[]
  >([]);
  // Tracks the Environment select explicitly, decoupled from pathaoBaseUrl,
  // so picking "Custom" can leave the URL blank for editing without the
  // empty-string-means-sandbox default (used for not-yet-configured stores)
  // snapping the select back to "Sandbox" on every render.
  const [pathaoUrlMode, setPathaoUrlMode] = React.useState<"sandbox" | "live" | "custom">(() => {
    if (initialSettings.pathaoBaseUrl === PATHAO_LIVE_URL) return "live";
    if (!initialSettings.pathaoBaseUrl || initialSettings.pathaoBaseUrl === PATHAO_SANDBOX_URL) {
      return "sandbox";
    }
    return "custom";
  });
  const [fetchingStores, setFetchingStores] = React.useState(false);
  const [storesError, setStoresError] = React.useState<string | null>(null);

  async function fetchPathaoStores() {
    setFetchingStores(true);
    setStoresError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courier/pathao/stores`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      setPathaoStores(body.stores ?? []);
    } catch (err) {
      setStoresError(err instanceof Error ? err.message : "Could not fetch stores.");
    } finally {
      setFetchingStores(false);
    }
  }

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  // Only one shipping courier can be active at a time, so enabling one
  // always turns the other off — never both, never ambiguous.
  function setCourierEnabled(courier: "steadfast" | "pathao", checked: boolean) {
    setSettings((s) => ({
      ...s,
      steadfastEnabled: courier === "steadfast" ? checked : checked ? false : s.steadfastEnabled,
      pathaoEnabled: courier === "pathao" ? checked : checked ? false : s.pathaoEnabled,
    }));
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSaving(true);
    setSaveError(null);

    try {
      // Store name/description are still local-only — no backend field
      // exists for them yet.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          insideDhakaRate: settings.insideDhakaRate,
          outsideDhakaRate: settings.outsideDhakaRate,
          codEnabled: settings.codEnabled,
          supportEmail: settings.supportEmail || null,
          supportPhone: settings.supportPhone || null,
          storeAddress: settings.storeAddress || null,
          facebookPixelId: settings.facebookPixelId || null,
          googleAnalyticsId: settings.googleAnalyticsId || null,
          googleTagManagerId: settings.googleTagManagerId || null,
          tiktokPixelId: settings.tiktokPixelId || null,
          smsGatewayUrl: settings.smsGatewayUrl || null,
          smsApiKey: settings.smsApiKey || null,
          smsSenderId: settings.smsSenderId || null,
          smsOrderConfirmationEnabled: settings.smsOrderConfirmationEnabled,
          smsOrderConfirmationTemplate: settings.smsOrderConfirmationTemplate || null,
          smsOrderCancelledEnabled: settings.smsOrderCancelledEnabled,
          smsOrderCancelledTemplate: settings.smsOrderCancelledTemplate || null,
          smsPromotionalEnabled: settings.smsPromotionalEnabled,
          steadfastEnabled: settings.steadfastEnabled,
          steadfastApiKey: settings.steadfastApiKey || null,
          steadfastSecretKey: settings.steadfastSecretKey || null,
          pathaoEnabled: settings.pathaoEnabled,
          pathaoBaseUrl: settings.pathaoBaseUrl || null,
          pathaoClientId: settings.pathaoClientId || null,
          pathaoClientSecret: settings.pathaoClientSecret || null,
          pathaoUsername: settings.pathaoUsername || null,
          pathaoPassword: settings.pathaoPassword || null,
          pathaoStoreId: settings.pathaoStoreId || null,
          bkashGatewayEnabled: settings.bkashGatewayEnabled,
          bkashBaseUrl: settings.bkashBaseUrl || null,
          bkashAppKey: settings.bkashAppKey || null,
          bkashAppSecret: settings.bkashAppSecret || null,
          bkashUsername: settings.bkashUsername || null,
          bkashPassword: settings.bkashPassword || null,
          bkashShippingAdvanceEnabled: settings.bkashShippingAdvanceEnabled,
          bkashPartialAdvanceEnabled: settings.bkashPartialAdvanceEnabled,
          // Fixed-amount mode was removed from the dashboard — always
          // percentage-based now, so this is no longer editable/sent.
          bkashPartialAdvanceMode: "percentage",
          bkashPartialAdvancePercent: settings.bkashPartialAdvancePercent,
          bkashPartialAdvanceFixedAmount: null,
          anthropicApiKey: settings.anthropicApiKey || null,
          aiProvider: settings.aiProvider,
          openaiApiKey: settings.openaiApiKey || null,
          openaiModel: settings.openaiModel || null,
          geminiApiKey: settings.geminiApiKey || null,
          geminiModel: settings.geminiModel || null,
          logoUrl: settings.logoUrl || null,
          faviconUrl: settings.faviconUrl || null,
          categoryShowcaseHeading: settings.categoryShowcaseHeading || null,
          metaTitle: settings.metaTitle || null,
          metaDescription: settings.metaDescription || null,
          emailLogoUrl: settings.emailLogoUrl || null,
          emailAccentColor: settings.emailAccentColor || null,
          emailFooterText: settings.emailFooterText || null,
          footerTagline: settings.footerTagline || null,
          footerInstagramUrl: settings.footerInstagramUrl || null,
          footerTwitterUrl: settings.footerTwitterUrl || null,
          footerFacebookUrl: settings.footerFacebookUrl || null,
          footerYoutubeUrl: settings.footerYoutubeUrl || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      setSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Tabs
        orientation="vertical"
        value={tab}
        onValueChange={(value) => {
          if (!value || !TAB_VALUES.includes(value as (typeof TAB_VALUES)[number])) return;
          setTab(value as (typeof TAB_VALUES)[number]);
          router.replace(`${pathname}?tab=${value}`, { scroll: false });
        }}
        className="flex-col gap-6 sm:flex-row sm:items-start"
      >
        <TabsList className="w-full shrink-0 sm:w-48">
          <TabsTrigger value="general">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="pixels">
            <Target className="h-4 w-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4" />
            AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="max-w-xl space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={settings.storeName}
              onChange={(e) => update("storeName", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update("supportEmail", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => update("supportPhone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              rows={3}
              value={settings.storeDescription}
              onChange={(e) => update("storeDescription", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input
              id="storeAddress"
              placeholder="Street address, city"
              value={settings.storeAddress}
              onChange={(e) => update("storeAddress", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown on the printable invoice footer, alongside Support Email
              and Support Phone above.
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">SEO</p>
            <p className="text-xs text-muted-foreground">
              The title and description shown in search results and browser
              tabs, storefront-wide. Leave blank to use the defaults.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              placeholder="Clozy"
              value={settings.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              rows={2}
              placeholder="Considered essentials, made to last. Designed in-house, shipped worldwide."
              value={settings.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="max-w-xl space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground">Logo</p>
            <p className="text-xs text-muted-foreground">
              Shown in the storefront header and footer, in place of the
              default Clozy wordmark. Leave empty to use the default.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLogoPickerOpen(true)}
              className="group relative flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageOff className="h-5 w-5" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                {settings.logoUrl ? "Change" : "Choose image"}
              </span>
            </button>

            {settings.logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update("logoUrl", "")}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          <MediaPickerDialog
            open={logoPickerOpen}
            onOpenChange={setLogoPickerOpen}
            multiple={false}
            onSelect={([url]) => url && update("logoUrl", url)}
          />

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">Favicon</p>
            <p className="text-xs text-muted-foreground">
              The small icon shown in browser tabs. A square image works
              best. Leave empty to use the default.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFaviconPickerOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              {settings.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.faviconUrl}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageOff className="h-5 w-5" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                {settings.faviconUrl ? "Change" : "Choose"}
              </span>
            </button>

            {settings.faviconUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update("faviconUrl", "")}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          <MediaPickerDialog
            open={faviconPickerOpen}
            onOpenChange={setFaviconPickerOpen}
            multiple={false}
            onSelect={([url]) => url && update("faviconUrl", url)}
          />

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">
              Category Banners
            </p>
            <p className="text-xs text-muted-foreground">
              The heading shown above the large category image banners on
              the homepage.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryShowcaseHeading">Heading</Label>
            <Input
              id="categoryShowcaseHeading"
              placeholder={DEFAULT_CATEGORY_SHOWCASE_HEADING}
              value={settings.categoryShowcaseHeading}
              onChange={(e) => update("categoryShowcaseHeading", e.target.value)}
            />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">Footer</p>
            <p className="text-xs text-muted-foreground">
              The tagline and social links shown in the footer&apos;s brand
              column. Leave a social link empty to hide that icon.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="footerTagline">Tagline</Label>
            <Textarea
              id="footerTagline"
              rows={2}
              placeholder="Considered essentials, made to last. Designed in-house, shipped worldwide."
              value={settings.footerTagline}
              onChange={(e) => update("footerTagline", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="footerInstagramUrl">Instagram URL</Label>
              <Input
                id="footerInstagramUrl"
                placeholder="https://instagram.com/yourstore"
                value={settings.footerInstagramUrl}
                onChange={(e) => update("footerInstagramUrl", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="footerTwitterUrl">Twitter / X URL</Label>
              <Input
                id="footerTwitterUrl"
                placeholder="https://x.com/yourstore"
                value={settings.footerTwitterUrl}
                onChange={(e) => update("footerTwitterUrl", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="footerFacebookUrl">Facebook URL</Label>
              <Input
                id="footerFacebookUrl"
                placeholder="https://facebook.com/yourstore"
                value={settings.footerFacebookUrl}
                onChange={(e) => update("footerFacebookUrl", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="footerYoutubeUrl">YouTube URL</Label>
              <Input
                id="footerYoutubeUrl"
                placeholder="https://youtube.com/@yourstore"
                value={settings.footerYoutubeUrl}
                onChange={(e) => update("footerYoutubeUrl", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="max-w-xl space-y-5">
          <p className="text-sm text-muted-foreground">
            Flat shipping rates applied at checkout, based on the customer's
            district.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="insideDhaka">Inside Dhaka (৳)</Label>
              <Input
                id="insideDhaka"
                type="number"
                min={0}
                value={settings.insideDhakaRate}
                onChange={(e) =>
                  update("insideDhakaRate", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outsideDhaka">Outside Dhaka (৳)</Label>
              <Input
                id="outsideDhaka"
                type="number"
                min={0}
                value={settings.outsideDhakaRate}
                onChange={(e) =>
                  update("outsideDhakaRate", Number(e.target.value))
                }
              />
            </div>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Only one courier can be active at a time — enabling one turns
            the other off.
          </p>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Steadfast Courier
                </p>
                <p className="text-xs text-muted-foreground">
                  Send fulfilled orders to Steadfast for delivery straight
                  from the Orders page.
                </p>
              </div>
              <Switch
                checked={settings.steadfastEnabled}
                onCheckedChange={(checked) => setCourierEnabled("steadfast", checked)}
              />
            </div>
            {settings.steadfastEnabled && (
              <>
                <Separator className="my-4" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="steadfastApiKey">API Key</Label>
                    <Input
                      id="steadfastApiKey"
                      type="password"
                      value={settings.steadfastApiKey}
                      onChange={(e) => update("steadfastApiKey", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="steadfastSecretKey">Secret Key</Label>
                    <Input
                      id="steadfastSecretKey"
                      type="password"
                      value={settings.steadfastSecretKey}
                      onChange={(e) => update("steadfastSecretKey", e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Found under your Steadfast merchant panel's API settings.
                </p>
              </>
            )}
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pathao Courier
                </p>
                <p className="text-xs text-muted-foreground">
                  Send fulfilled orders to Pathao for delivery straight from
                  the Orders page.
                </p>
              </div>
              <Switch
                checked={settings.pathaoEnabled}
                onCheckedChange={(checked) => setCourierEnabled("pathao", checked)}
              />
            </div>
            {settings.pathaoEnabled && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1.5">
                  <Label htmlFor="pathaoEnvironment">Environment</Label>
                  <Select
                    value={pathaoUrlMode}
                    onValueChange={(value) => {
                      if (!value) return;
                      setPathaoUrlMode(value as "sandbox" | "live" | "custom");
                      if (value === "live") update("pathaoBaseUrl", PATHAO_LIVE_URL);
                      else if (value === "sandbox") update("pathaoBaseUrl", PATHAO_SANDBOX_URL);
                      else if (settings.pathaoBaseUrl === PATHAO_LIVE_URL || settings.pathaoBaseUrl === PATHAO_SANDBOX_URL) {
                        update("pathaoBaseUrl", "");
                      }
                    }}
                  >
                    <SelectTrigger id="pathaoEnvironment" className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (testing)</SelectItem>
                      <SelectItem value="live">Live (real deliveries)</SelectItem>
                      <SelectItem value="custom">Custom URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {pathaoUrlMode === "live"
                      ? "Live — orders sent to Pathao from here become real deliveries."
                      : pathaoUrlMode === "sandbox"
                        ? "Sandbox — safe for testing, nothing gets actually shipped."
                        : "Point this at your own Pathao-compatible endpoint."}
                  </p>
                  {pathaoUrlMode === "custom" && (
                    <Input
                      id="pathaoBaseUrl"
                      placeholder={PATHAO_SANDBOX_URL}
                      value={settings.pathaoBaseUrl}
                      onChange={(e) => update("pathaoBaseUrl", e.target.value)}
                    />
                  )}
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pathaoClientId">Client ID</Label>
                    <Input
                      id="pathaoClientId"
                      type="password"
                      value={settings.pathaoClientId}
                      onChange={(e) => update("pathaoClientId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pathaoClientSecret">Client Secret</Label>
                    <Input
                      id="pathaoClientSecret"
                      type="password"
                      value={settings.pathaoClientSecret}
                      onChange={(e) => update("pathaoClientSecret", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pathaoUsername">Username</Label>
                    <Input
                      id="pathaoUsername"
                      value={settings.pathaoUsername}
                      onChange={(e) => update("pathaoUsername", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pathaoPassword">Password</Label>
                    <Input
                      id="pathaoPassword"
                      type="password"
                      value={settings.pathaoPassword}
                      onChange={(e) => update("pathaoPassword", e.target.value)}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Store</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={fetchingStores}
                      onClick={fetchPathaoStores}
                    >
                      {fetchingStores ? "Fetching…" : "Fetch stores"}
                    </Button>
                  </div>
                  {pathaoStores.length > 0 ? (
                    <Select
                      value={settings.pathaoStoreId}
                      onValueChange={(value) => update("pathaoStoreId", value ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                      <SelectContent>
                        {pathaoStores.map((s) => (
                          <SelectItem key={s.storeId} value={String(s.storeId)}>
                            {s.storeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {settings.pathaoStoreId
                        ? `Current store ID: ${settings.pathaoStoreId}`
                        : "Save your credentials above, then click “Fetch stores” to pick your Pathao store."}
                    </p>
                  )}
                  {storesError && (
                    <p className="text-xs text-destructive">{storesError}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="max-w-xl space-y-5">
          {/* A plain segmented control rather than a nested <Tabs> — the
              shared Tabs primitive hardcodes its group name to "tabs", so a
              second one nested inside the outer (vertical) Settings Tabs
              would inherit its vertical/stacked styling instead of staying
              horizontal. */}
          <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground">
            {(
              [
                { value: "method", label: "Payment Method" },
                { value: "credential", label: "Payment Credential" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentSubTab(option.value)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
                  paymentSubTab === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {paymentSubTab === "method" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Let customers pay in cash when their order arrives.
                  </p>
                </div>
                <Switch
                  checked={settings.codEnabled}
                  onCheckedChange={(checked) => update("codEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    bKash Payment Gateway
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customers pay through bKash&apos;s own hosted checkout
                    page — no manual number collection needed. Set up its API
                    credentials under Payment Credential.
                  </p>
                </div>
                <Switch
                  checked={settings.bkashGatewayEnabled}
                  onCheckedChange={(checked) => update("bkashGatewayEnabled", checked)}
                />
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pay Shipping Fee via bKash
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customer pays just the shipping fee via bKash at
                      checkout, then pays the rest in cash on delivery.
                      {!settings.bkashGatewayEnabled &&
                        " Requires the bKash Payment Gateway to be enabled."}
                    </p>
                  </div>
                  <Switch
                    checked={settings.bkashShippingAdvanceEnabled}
                    disabled={!settings.bkashGatewayEnabled}
                    onCheckedChange={(checked) =>
                      update("bkashShippingAdvanceEnabled", checked)
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Advance Payment via bKash
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customer pays the shipping fee plus a set percentage or
                      amount of the product price via bKash at checkout, then
                      pays the rest in cash on delivery.
                      {!settings.bkashGatewayEnabled &&
                        " Requires the bKash Payment Gateway to be enabled."}
                    </p>
                  </div>
                  <Switch
                    checked={settings.bkashPartialAdvanceEnabled}
                    disabled={!settings.bkashGatewayEnabled}
                    onCheckedChange={(checked) =>
                      update("bkashPartialAdvanceEnabled", checked)
                    }
                  />
                </div>

                {settings.bkashPartialAdvanceEnabled && (
                  <>
                    <Separator className="my-4" />
                    <div className="max-w-xs space-y-1.5">
                      <Label htmlFor="bkashPartialAdvancePercent">Percent of product price (%)</Label>
                      <Input
                        id="bkashPartialAdvancePercent"
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={settings.bkashPartialAdvancePercent}
                        onChange={(e) =>
                          update("bkashPartialAdvancePercent", Number(e.target.value))
                        }
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shipping fee plus this percentage of the product price
                      is charged upfront via bKash, capped at the order
                      total.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {paymentSubTab === "credential" && (
            <div className="rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  bKash Payment Gateway
                </p>
                <p className="text-xs text-muted-foreground">
                  {settings.bkashGatewayEnabled
                    ? "Currently enabled — turn it off under Payment Method if you need to take it offline."
                    : "Currently disabled — enable it under Payment Method once these credentials are set."}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5">
                <Label htmlFor="bkashBaseUrl">API Base URL</Label>
                <Input
                  id="bkashBaseUrl"
                  placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
                  value={settings.bkashBaseUrl}
                  onChange={(e) => update("bkashBaseUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Sandbox by default — switch to the production URL when
                  you're ready to go live.
                </p>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bkashAppKey">App Key</Label>
                  <Input
                    id="bkashAppKey"
                    type="password"
                    value={settings.bkashAppKey}
                    onChange={(e) => update("bkashAppKey", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bkashAppSecret">App Secret</Label>
                  <Input
                    id="bkashAppSecret"
                    type="password"
                    value={settings.bkashAppSecret}
                    onChange={(e) => update("bkashAppSecret", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bkashUsername">Username</Label>
                  <Input
                    id="bkashUsername"
                    value={settings.bkashUsername}
                    onChange={(e) => update("bkashUsername", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bkashPassword">Password</Label>
                  <Input
                    id="bkashPassword"
                    type="password"
                    value={settings.bkashPassword}
                    onChange={(e) => update("bkashPassword", e.target.value)}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Found in your bKash merchant/developer portal, under API
                credentials.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pixels" className="max-w-xl space-y-5">
          <p className="text-sm text-muted-foreground">
            Add tracking IDs to fire the matching pixel on every storefront
            page. Leave a field blank to skip that provider.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="facebookPixelId">Meta (Facebook) Pixel ID</Label>
            <Input
              id="facebookPixelId"
              placeholder="e.g. 123456789012345"
              value={settings.facebookPixelId}
              onChange={(e) => update("facebookPixelId", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="googleAnalyticsId">
              Google Analytics Measurement ID
            </Label>
            <Input
              id="googleAnalyticsId"
              placeholder="e.g. G-XXXXXXXXXX"
              value={settings.googleAnalyticsId}
              onChange={(e) => update("googleAnalyticsId", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="googleTagManagerId">
              Google Tag Manager Container ID
            </Label>
            <Input
              id="googleTagManagerId"
              placeholder="e.g. GTM-XXXXXXX"
              value={settings.googleTagManagerId}
              onChange={(e) => update("googleTagManagerId", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tiktokPixelId">TikTok Pixel ID</Label>
            <Input
              id="tiktokPixelId"
              placeholder="e.g. CXXXXXXXXXXXXXXXXXXX"
              value={settings.tiktokPixelId}
              onChange={(e) => update("tiktokPixelId", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="sms" className="max-w-xl space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground">Gateway</p>
              <p className="text-xs text-muted-foreground">
                A generic HTTP gateway — fill in your provider's details
                (SSL Wireless, BulkSMSBD, Alpha SMS, etc).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smsGatewayUrl">Gateway URL</Label>
              <Input
                id="smsGatewayUrl"
                placeholder="https://api.yourprovider.com/send"
                value={settings.smsGatewayUrl}
                onChange={(e) => update("smsGatewayUrl", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="smsApiKey">API Key</Label>
                <Input
                  id="smsApiKey"
                  type="password"
                  value={settings.smsApiKey}
                  onChange={(e) => update("smsApiKey", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smsSenderId">Sender ID</Label>
                <Input
                  id="smsSenderId"
                  placeholder="e.g. CLOZY"
                  value={settings.smsSenderId}
                  onChange={(e) => update("smsSenderId", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Order Confirmation SMS
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent to the customer's phone right after an order is placed.
                </p>
              </div>
              <Switch
                checked={settings.smsOrderConfirmationEnabled}
                onCheckedChange={(checked) =>
                  update("smsOrderConfirmationEnabled", checked)
                }
              />
            </div>
            {settings.smsOrderConfirmationEnabled && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1.5">
                  <Label htmlFor="smsOrderConfirmationTemplate">Message</Label>
                  <Textarea
                    id="smsOrderConfirmationTemplate"
                    rows={3}
                    value={settings.smsOrderConfirmationTemplate}
                    onChange={(e) =>
                      update("smsOrderConfirmationTemplate", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Placeholders: {"{customer_name}"}, {"{order_number}"}, {"{total}"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Order Cancelled SMS
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent when an order's status is changed to Cancelled.
                </p>
              </div>
              <Switch
                checked={settings.smsOrderCancelledEnabled}
                onCheckedChange={(checked) =>
                  update("smsOrderCancelledEnabled", checked)
                }
              />
            </div>
            {settings.smsOrderCancelledEnabled && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1.5">
                  <Label htmlFor="smsOrderCancelledTemplate">Message</Label>
                  <Textarea
                    id="smsOrderCancelledTemplate"
                    rows={3}
                    value={settings.smsOrderCancelledTemplate}
                    onChange={(e) =>
                      update("smsOrderCancelledTemplate", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Placeholders: {"{customer_name}"}, {"{order_number}"}, {"{total}"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Promotional SMS
              </p>
              <p className="text-xs text-muted-foreground">
                Allow sending one-off marketing SMS blasts from Dashboard
                &gt; SMS &gt; Promotional.
              </p>
            </div>
            <Switch
              checked={settings.smsPromotionalEnabled}
              onCheckedChange={(checked) =>
                update("smsPromotionalEnabled", checked)
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="email" className="max-w-xl space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground">Logo</p>
            <p className="text-xs text-muted-foreground">
              Shown at the top of transactional emails (e.g. email
              verification). Independent from the site logo, so you can use a
              version sized or colored for email clients. Leave empty to show
              the store name as text instead.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setEmailLogoPickerOpen(true)}
              className="group relative flex h-16 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              {settings.emailLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.emailLogoUrl}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageOff className="h-5 w-5" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                {settings.emailLogoUrl ? "Change" : "Choose image"}
              </span>
            </button>

            {settings.emailLogoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update("emailLogoUrl", "")}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          <MediaPickerDialog
            open={emailLogoPickerOpen}
            onOpenChange={setEmailLogoPickerOpen}
            multiple={false}
            onSelect={([url]) => url && update("emailLogoUrl", url)}
          />

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="emailAccentColor">Accent Color</Label>
            <p className="text-xs text-muted-foreground">
              Used for the button and links in transactional emails.
            </p>
            <div className="flex items-center gap-2">
              <input
                id="emailAccentColor"
                type="color"
                value={settings.emailAccentColor || DEFAULT_ACCENT_COLOR}
                onChange={(e) => update("emailAccentColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
              <Input
                value={settings.emailAccentColor}
                placeholder={DEFAULT_ACCENT_COLOR}
                onChange={(e) => update("emailAccentColor", e.target.value)}
                className="max-w-32"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="emailFooterText">Footer Text</Label>
            <p className="text-xs text-muted-foreground">
              Shown at the bottom of every transactional email. Leave empty
              to show a default copyright line.
            </p>
            <Textarea
              id="emailFooterText"
              rows={2}
              placeholder={`© ${new Date().getFullYear()} Clozy. All rights reserved.`}
              value={settings.emailFooterText}
              onChange={(e) => update("emailFooterText", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="max-w-xl space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground">Provider</p>
            <p className="text-xs text-muted-foreground">
              Powers both the storefront chat widget and the &quot;Generate
              AI Insights&quot; button on the Analytics page. Both providers&apos;
              keys can be saved at once — this just decides which one is
              actually used.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aiProvider">Active Provider</Label>
            <Select
              value={settings.aiProvider}
              onValueChange={(value) =>
                value && update("aiProvider", value as SettingsState["aiProvider"])
              }
            >
              <SelectTrigger id="aiProvider" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">
              Anthropic (Claude)
            </p>
            <p className="text-xs text-muted-foreground">
              Get a key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                console.anthropic.com
              </a>
              . Leave blank to disable AI features while this provider is active.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="anthropicApiKey">API Key</Label>
            <Input
              id="anthropicApiKey"
              type="password"
              placeholder="sk-ant-…"
              value={settings.anthropicApiKey}
              onChange={(e) => update("anthropicApiKey", e.target.value)}
            />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">OpenAI</p>
            <p className="text-xs text-muted-foreground">
              Get a key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                platform.openai.com
              </a>
              . Leave blank to disable AI features while this provider is active.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="openaiApiKey">API Key</Label>
            <Input
              id="openaiApiKey"
              type="password"
              placeholder="sk-…"
              value={settings.openaiApiKey}
              onChange={(e) => update("openaiApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="openaiModel">Model</Label>
            <Input
              id="openaiModel"
              placeholder="gpt-4o-mini"
              value={settings.openaiModel}
              onChange={(e) => update("openaiModel", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use gpt-4o-mini.
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">Google Gemini</p>
            <p className="text-xs text-muted-foreground">
              Get a key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                aistudio.google.com
              </a>
              . Leave blank to disable AI features while this provider is active.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="geminiApiKey">API Key</Label>
            <Input
              id="geminiApiKey"
              type="password"
              placeholder="AIza…"
              value={settings.geminiApiKey}
              onChange={(e) => update("geminiApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="geminiModel">Model</Label>
            <Input
              id="geminiModel"
              placeholder="gemini-flash-latest"
              value={settings.geminiModel}
              onChange={(e) => update("geminiModel", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use gemini-flash-latest.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        {saved && !saving && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-500">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

export default SettingsForm;
