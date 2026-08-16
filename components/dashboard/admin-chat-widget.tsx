"use client";

import * as React from "react";
import { MessageCircle, X, Send, Sparkles, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getSettings } from "@/lib/get-settings";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your store ops copilot. Ask me about orders, products, or recent performance — I can only see what you have permission to view in the dashboard.",
};

/**
 * Dashboard-only counterpart to components/chat-widget.tsx (the public
 * storefront one) — talks to /admin/chat instead of /chat, sends the
 * admin's bearer token, and has no product-carousel result list since the
 * ops copilot's tools return orders/products/stats described in plain text
 * rather than a browsable catalog result.
 */
export function AdminChatWidget() {
  const { token, ready } = useAuth();
  const [enabled, setEnabled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    getSettings()
      .then((s) => setEnabled(s.aiChatEnabled))
      .catch(() => {
        // Best-effort — the widget just stays hidden if settings can't load.
      });
  }, []);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!enabled || !ready || !token) return null;

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      if (body.configured === false) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "The store ops copilot isn't configured yet — add an API key in Settings > AI." },
        ]);
        return;
      }

      if (body.error) {
        setError(body.error);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: body.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Store Ops Copilot</span>
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
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
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
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, products, sales…"
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

export default AdminChatWidget;
