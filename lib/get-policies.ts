export type PolicySummary = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string | null;
};

export type Policy = PolicySummary & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function getPublishedPolicies(): Promise<PolicySummary[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
