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
};

const INITIAL_SETTINGS: SettingsState = {
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

export function SettingsForm() {
  const [settings, setSettings] = React.useState(INITIAL_SETTINGS);
  const [saved, setSaved] = React.useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function handleSave(e: React.SubmitEvent) {
    e.preventDefault();
    // No settings API yet — this just reflects the change locally.
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
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
      </Tabs>

      <div className="flex items-center gap-3">
        <Button type="submit">Save Changes</Button>
        {saved && (
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
