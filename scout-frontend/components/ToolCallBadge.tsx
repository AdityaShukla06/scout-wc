"use client";

import { useEffect, useState } from "react";

interface ToolCallBadgeProps {
  status: "loading" | "done";
  query?: string;
}

export default function ToolCallBadge({ status, query }: ToolCallBadgeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === "done") {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible) return null;

  if (status === "loading") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full w-fit"
        style={{
          backgroundColor: "var(--accent-glow)",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-green flex-shrink-0"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <span
          className="text-xs font-mono"
          style={{ color: "var(--accent)" }}
        >
          Querying MongoDB Atlas...
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full w-fit transition-opacity duration-500"
      style={{
        border: "1px solid var(--border)",
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>
        MongoDB
      </span>
      {query && (
        <span className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>
          {query}
        </span>
      )}
    </div>
  );
}
