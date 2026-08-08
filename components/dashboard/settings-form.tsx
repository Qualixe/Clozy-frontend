"use client";

import * as React from "react";
import { Check, ImageOff, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/dashboard/media-picker-dialog";
import { useAuth } from "@/lib/auth-context";
import type { AdminStoreSettings } from "@/lib/get-settings";

type SettingsState = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  storeDescription: string;
  insideDhakaRate: number;
  outsideDhakaRate: number;
  codEnabled: boolean;
  bkashEnabled: boolean;
  bkashMerchantNumber: string;
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
  anthropicApiKey: string;
  logoUrl: string;
  faviconUrl: string;
};

const DEFAULT_CONFIRMATION_TEMPLATE =
  "Hi {customer_name}, your order {order_number} has been confirmed. Total: {total}. Thank you for shopping with us!";
const DEFAULT_CANCELLED_TEMPLATE =
  "Hi {customer_name}, your order {order_number} has been cancelled. Contact us if you have questions.";

const INITIAL_SETTINGS: Pick<
  SettingsState,
  | "storeName"
  | "supportEmail"
  | "supportPhone"
  | "storeDescription"
  | "insideDhakaRate"
  | "outsideDhakaRate"
  | "codEnabled"
  | "bkashEnabled"
  | "bkashMerchantNumber"
> = {
  storeName: "Clozy",
  supportEmail: "hello@clozy.com",
  supportPhone: "+880 1234 567890",
  storeDescription:
    "Considered essentials, made to last. Designed in-house, shipped worldwide.",
  insideDhakaRate: 3,
  outsideDhakaRate: 6,
  codEnabled: true,
  bkashEnabled: true,
  bkashMerchantNumber: "01700000000",
};

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: AdminStoreSettings;
}) {
  const { token } = useAuth();
  const [settings, setSettings] = React.useState<SettingsState>({
    ...INITIAL_SETTINGS,
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
    anthropicApiKey: initialSettings.anthropicApiKey ?? "",
    logoUrl: initialSettings.logoUrl ?? "",
    faviconUrl: initialSettings.faviconUrl ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = React.useState(false);
  const [faviconPickerOpen, setFaviconPickerOpen] = React.useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSaving(true);
    setSaveError(null);

    try {
      // Only the Pixels and SMS tabs are backed by a real API right now —
      // the rest of this form (store/shipping/payment) is still local-only.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
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
          anthropicApiKey: settings.anthropicApiKey || null,
          logoUrl: settings.logoUrl || null,
          faviconUrl: settings.faviconUrl || null,
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
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="pixels">Pixels</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 max-w-xl space-y-5">
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
        </TabsContent>

        <TabsContent value="branding" className="mt-6 max-w-xl space-y-5">
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
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 max-w-xl space-y-5">
          <p className="text-sm text-muted-foreground">
            Flat shipping rates applied at checkout, based on the customer's
            district.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="insideDhaka">Inside Dhaka ($)</Label>
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
              <Label htmlFor="outsideDhaka">Outside Dhaka ($)</Label>
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
        </TabsContent>

        <TabsContent value="payment" className="mt-6 max-w-xl space-y-5">
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

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">bKash</p>
                <p className="text-xs text-muted-foreground">
                  Accept payments through bKash.
                </p>
              </div>
              <Switch
                checked={settings.bkashEnabled}
                onCheckedChange={(checked) => update("bkashEnabled", checked)}
              />
            </div>

            {settings.bkashEnabled && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1.5">
                  <Label htmlFor="bkashMerchantNumber">
                    bKash Merchant Number
                  </Label>
                  <Input
                    id="bkashMerchantNumber"
                    value={settings.bkashMerchantNumber}
                    onChange={(e) =>
                      update("bkashMerchantNumber", e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pixels" className="mt-6 max-w-xl space-y-5">
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

        <TabsContent value="sms" className="mt-6 max-w-xl space-y-6">
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

        <TabsContent value="ai" className="mt-6 max-w-xl space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Claude API Key
            </p>
            <p className="text-xs text-muted-foreground">
              Powers the &quot;Generate AI Insights&quot; button on the
              Analytics page. Get a key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                console.anthropic.com
              </a>
              . Leave blank to disable AI insights.
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
