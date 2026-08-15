import Link from "next/link";
import { Send, History, ChevronRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Promotional",
    description: "Compose and send a one-off marketing SMS to past customers.",
    href: "/dashboard/sms/promotional",
    icon: Send,
  },
  {
    title: "Logs",
    description: "Every SMS sent — confirmations, cancellations, and promotional.",
    href: "/dashboard/sms/logs",
    icon: History,
  },
];

export default function DashboardSmsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">SMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send promotional messages and review delivery history. Configure
          the gateway and order notifications in Settings &gt; SMS.
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
