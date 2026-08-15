import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Can } from "@/components/can";
import { FaqDialog } from "@/components/dashboard/faq-dialog";
import { FaqsTable } from "@/components/dashboard/faqs-table";
import { assertDashboardFetchOk, getServerAuthHeaders } from "@/lib/auth-server";
import type { Faq } from "@/lib/get-faqs";

async function getFaqs(): Promise<Faq[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs`, {
    cache: "no-store",
    headers: await getServerAuthHeaders(),
  });
  assertDashboardFetchOk(res);
  return res.json();
}

export default async function DashboardFaqsPage() {
  const faqs = await getFaqs();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/cms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          CMS
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">FAQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions and answers shown on your storefront's FAQ page. Drag
            to reorder.
          </p>
        </div>
        <Can permission="create_cms_pages">
          <FaqDialog />
        </Can>
      </div>

      <FaqsTable faqs={faqs} />
    </div>
  );
}
