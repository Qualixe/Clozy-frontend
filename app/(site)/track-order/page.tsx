import { Suspense } from "react";

import TrackOrderPage from "@/components/track-order-page";

export default function Page() {
  return (
    <Suspense>
      <TrackOrderPage />
    </Suspense>
  );
}
