"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, X, Send, Sparkles, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm the Clozy shopping assistant. Ask me about products, sizing, or shipping — I can search the catalog for you.",
};

export function ChatWidget({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([GREETING]);
  const [products, setProducts] = React.useState<ChatProduct[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, products, open]);

  if (!enabled) return null;

  async function handleSend(e: React.SubmitEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      if (body.configured === false) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Chat isn't available right now — please contact support instead." },
        ]);
        return;
      }

      if (body.error) {
        setError(body.error);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: body.reply }]);
      setProducts(body.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-5 z-50 flex flex-col items-end gap-3 md:bottom-5">
      {open && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Clozy Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-foreground text-background"
                    : "bg-muted text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                Thinking…
              </div>
            )}

            {error && (
              <div className="flex max-w-[85%] items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {products.length > 0 && (
              <div className="space-y-2 pt-1">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-2 hover:bg-muted"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.image && (
                        <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a product…"
              className="h-9 flex-1 rounded-full border border-border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={2000}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              disabled={sending || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="h-12 w-12 rounded-full shadow-lg"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export default ChatWidget;
