import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SmsLogsTable, type SmsLog } from "@/components/dashboard/sms-logs-table";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getLogs(): Promise<SmsLog[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sms/logs`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardSmsLogsPage() {
  const logs = await getLogs();

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
        <h1 className="text-2xl font-semibold text-foreground">SMS Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {logs.length} messages sent.
        </p>
      </div>

      <SmsLogsTable logs={logs} />
    </div>
  );
}
