"use client";

import * as React from "react";
import { Check } from "lucide-react";

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
import { useAuth } from "@/lib/auth-context";
import type { StoreSettings } from "@/lib/get-settings";

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
};

const INITIAL_SETTINGS: Omit<
  SettingsState,
  "facebookPixelId" | "googleAnalyticsId" | "googleTagManagerId" | "tiktokPixelId"
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
  initialPixelSettings,
}: {
  initialPixelSettings: StoreSettings;
}) {
  const { token } = useAuth();
  const [settings, setSettings] = React.useState<SettingsState>({
    ...INITIAL_SETTINGS,
    facebookPixelId: initialPixelSettings.facebookPixelId ?? "",
    googleAnalyticsId: initialPixelSettings.googleAnalyticsId ?? "",
    googleTagManagerId: initialPixelSettings.googleTagManagerId ?? "",
    tiktokPixelId: initialPixelSettings.tiktokPixelId ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();

    setSaving(true);
    setSaveError(null);

    try {
      // Only the Pixels tab is backed by a real API right now — the rest
      // of this form (store/shipping/payment) is still local-only.
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
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="pixels">Pixels</TabsTrigger>
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
