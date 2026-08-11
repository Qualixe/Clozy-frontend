import { SubscribersTable, type Subscriber } from "@/components/dashboard/subscribers-table";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getSubscribers(): Promise<Subscriber[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardSubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subscribers.length} people subscribed to the newsletter.
        </p>
      </div>

      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}
