import type { Metadata } from "next";

import { NotFoundScene } from "@/components/not-found-scene";

export const metadata: Metadata = {
  title: "Page Not Found — Clozy",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return <NotFoundScene />;
}
