"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "@/components/ChatMessage";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import TypingIndicator from "@/components/TypingIndicator";
import { ArrowUp } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, history: messages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        toolCalls: data.toolCalls,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 z-20"
        style={{
          height: "56px",
          background: "rgba(8,12,16,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="4" fill="rgba(34,197,94,0.12)" />
            <rect x="0" y="6.5" width="20" height="1" fill="rgba(34,197,94,0.4)" />
            <rect x="0" y="12.5" width="20" height="1" fill="rgba(34,197,94,0.4)" />
            <rect x="9.5" y="0" width="1" height="20" fill="rgba(34,197,94,0.4)" />
            <circle cx="10" cy="10" r="3" stroke="rgba(34,197,94,0.6)" strokeWidth="1" fill="none" />
          </svg>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Scout
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-green"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Live
            </span>
          </div>
        </div>

        <div
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            letterSpacing: "0.02em",
          }}
        >
          FIFA World Cup 2026
        </div>
      </header>

      {/* Main scrollable area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "160px" }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            /* Empty state */
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{ minHeight: "calc(100vh - 280px)" }}
            >
              {/* Pitch line background pattern */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--border) 1px, transparent 1px),
                    linear-gradient(90deg, var(--border) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                  opacity: 0.03,
                }}
              />

              <div
                className="w-16 h-16 flex items-center justify-center rounded-2xl mb-6 relative"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="rgba(34,197,94,0.8)" strokeWidth="1.5" fill="none" />
                  <path d="M16 2 L20 10 L16 8 L12 10 Z" fill="rgba(34,197,94,0.6)" />
                  <path d="M16 30 L20 22 L16 24 L12 22 Z" fill="rgba(34,197,94,0.6)" />
                  <path d="M2 16 L10 12 L8 16 L10 20 Z" fill="rgba(34,197,94,0.6)" />
                  <path d="M30 16 L22 12 L24 16 L22 20 Z" fill="rgba(34,197,94,0.6)" />
                  <circle cx="16" cy="16" r="3" fill="rgba(34,197,94,0.3)" stroke="rgba(34,197,94,0.8)" strokeWidth="1" />
                </svg>
              </div>

              <h2
                className="text-4xl font-bold tracking-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Scout
              </h2>
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--accent)" }}
              >
                World Cup Intelligence
              </p>
              <p
                className="text-sm mb-10 max-w-sm"
                style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}
              >
                Ask me anything about teams, matches, venues, or travel.
              </p>

              <SuggestedQuestions onSelect={handleSend} />
            </div>
          ) : (
            <div className="flex flex-col w-full gap-6">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-fade-slide">
                  <ChatMessage message={msg} />
                </div>
              ))}
              {isLoading && (
                <div className="animate-fade-slide">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Fixed input area */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-3"
        style={{
          background: `linear-gradient(to top, var(--bg-base) 70%, transparent)`,
        }}
      >
        <div
          className="max-w-3xl mx-auto rounded-2xl"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-bright)",
            boxShadow: "0 0 40px rgba(34,197,94,0.05)",
          }}
        >
          <div className="flex items-end gap-3 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Scout about matches, teams, or travel..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-[var(--text-dim)]"
              style={{
                color: "var(--text-primary)",
                minHeight: "24px",
                maxHeight: "120px",
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                backgroundColor: input.trim() && !isLoading ? "var(--accent)" : "var(--bg-hover)",
                cursor: input.trim() && !isLoading ? "pointer" : "default",
              }}
            >
              {isLoading ? (
                <div
                  className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                />
              ) : (
                <ArrowUp
                  className="w-4 h-4"
                  style={{ color: input.trim() ? "white" : "var(--text-dim)" }}
                />
              )}
            </button>
          </div>
        </div>
        <p
          className="text-center text-xs mt-2"
          style={{ color: "var(--text-dim)" }}
        >
          Scout uses MongoDB Atlas + Gemini 2.0
        </p>
      </div>
    </div>
  );
}
