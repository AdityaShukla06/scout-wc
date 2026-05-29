"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "@/components/ChatMessage";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import TypingIndicator from "@/components/TypingIndicator";
import { Send } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: messages
        })
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Scout 
          </h1>
          <p className="text-sm font-medium text-emerald-500">2026 FIFA World Cup AI</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-12 mb-8 text-center px-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <span className="text-3xl"></span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Scout</h2>
              <p className="text-zinc-400 mb-8 max-w-md text-sm">
                Your AI companion for the 2026 FIFA World Cup. Powered by MongoDB Atlas and Google Cloud.
              </p>
              <SuggestedQuestions onSelect={handleSend} />
            </div>
          ) : (
            <div className="flex flex-col w-full pb-10">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex w-full justify-start mb-6">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Scout about matches, teams, or travel..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-[52px] min-h-[52px] max-h-32 shadow-sm"
            rows={1}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium uppercase tracking-wider">
          MongoDB + Vertex AI Agent Builder
        </p>
      </footer>
    </div>
  );
}
