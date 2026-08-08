import Link from "next/link";
import { ListTree, Images, ScrollText, HelpCircle, ChevronRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Menus",
    description: "The navigation shown in your storefront header.",
    href: "/dashboard/content/menus",
    icon: ListTree,
  },
  {
    title: "Policies",
    description: "Privacy, terms, and other policy pages.",
    href: "/dashboard/content/policies",
    icon: ScrollText,
  },
  {
    title: "FAQs",
    description: "Questions and answers shown on your storefront's FAQ page.",
    href: "/dashboard/content/faqs",
    icon: HelpCircle,
  },
  {
    title: "Media",
    description: "Every image currently in use across products and categories.",
    href: "/dashboard/content/media",
    icon: Images,
  },
];

export default function DashboardContentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your storefront's navigation and media.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
