import { FaqSection } from "@/components/faq-section";
import { getPublishedFaqs } from "@/lib/get-faqs";

export const metadata = {
  title: "FAQ",
};

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  return <FaqSection faqs={faqs} />;
}
