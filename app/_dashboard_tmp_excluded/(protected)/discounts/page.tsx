import { DiscountsTable } from "@/components/dashboard/discounts-table";
import type { Discount } from "@/components/dashboard/discount-dialog";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getDiscounts(): Promise<Discount[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Discounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {discounts.length} discount codes configured.
        </p>
      </div>

      <DiscountsTable discounts={discounts} />
    </div>
  );
}
