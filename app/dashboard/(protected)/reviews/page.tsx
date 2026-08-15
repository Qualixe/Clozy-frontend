import { ReviewsTable, type Review } from "@/components/dashboard/reviews-table";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";

async function getReviews(): Promise<Review[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardReviewsPage() {
  const reviews = await getReviews();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviews.length} reviews total
          {pendingCount > 0 ? ` · ${pendingCount} awaiting approval` : ""}.
        </p>
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
