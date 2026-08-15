export type Faq = {
  id: string;
  question: string;
  answer: string;
  status: "draft" | "published";
};

export async function getPublishedFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
