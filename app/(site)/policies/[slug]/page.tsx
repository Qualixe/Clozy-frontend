import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

import { getPolicyBySlug } from "@/lib/get-policies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);
  if (!policy) return { title: "Policy" };

  return {
    title: policy.seoTitle || policy.title,
    description: policy.seoDescription || undefined,
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);

  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/policies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Policies
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {policy.title}
      </h1>
      {policy.updatedAt && (
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated{" "}
          {new Date(policy.updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <div
        className="prose prose-sm mt-10 max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
      />
    </div>
  );
}
