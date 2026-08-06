import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  SmsPromotionalForm,
  type SmsRecipient,
} from "@/components/dashboard/sms-promotional-form";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getRecipients(): Promise<SmsRecipient[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sms/recipients`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardSmsPromotionalPage() {
  const recipients = await getRecipients();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/sms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          SMS
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Promotional SMS
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick recipients from past customers, or add numbers manually.
        </p>
      </div>

      <SmsPromotionalForm recipients={recipients} />
    </div>
  );
}
