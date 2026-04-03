import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Loader2, MessageCircle, RefreshCw, SendHorizonal, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm SalesIQ Copilot. Ask me about dashboards, sales KPIs, forecasting, admin features, or how to use this site.",
};

const QUICK_PROMPTS = [
  "Give me a quick tour of this site",
  "What KPIs should I watch for an e-commerce store?",
  "How can I use the forecast dashboard better?",
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${role}-${Date.now()}`,
    role,
    content,
  };
}

export default function SiteChatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = input.trim().length > 0 && !isSending;
  const isFreshChat = useMemo(() => messages.length === 1, [messages.length]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    const nextUserMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: location.pathname,
          messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || typeof data?.reply !== "string" || !data.reply.trim()) {
        throw new Error(data?.error || "The assistant could not answer right now.");
      }

      setMessages((currentMessages) => [...currentMessages, createMessage("assistant", data.reply.trim())]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "The assistant could not answer right now.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setError("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-[0_24px_80px_-32px_rgba(59,130,246,0.65)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-secondary/40 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SalesIQ Copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground"
                onClick={resetChat}
                aria-label="Reset conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[24rem] space-y-4 overflow-y-auto px-4 py-4">
            {isFreshChat && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/80 bg-background/80 text-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/70 bg-card px-4 py-4">
            {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Ask about sales trends, reports, or how this app works..."
                className="min-h-[92px] resize-none border-border/80 bg-background/70"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground">Press Enter to send, Shift + Enter for a new line.</p>
                <Button
                  type="button"
                  className="rounded-full px-4"
                  disabled={!canSend}
                  onClick={() => void sendMessage(input)}
                >
                  Send <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="h-14 rounded-full px-5 shadow-[0_16px_48px_-24px_rgba(59,130,246,0.85)]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span>{isOpen ? "Close AI" : "Ask AI"}</span>
      </Button>
    </div>
  );
}
