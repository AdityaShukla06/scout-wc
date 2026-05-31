import { Message } from "@/lib/types";
import ToolCallBadge from "./ToolCallBadge";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 0.5em 0", lineHeight: "1.7", color: "var(--text-primary)" }}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: "var(--text-primary)" }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: "1.25em", margin: "0.5em 0", listStyleType: "disc" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: "1.25em", margin: "0.5em 0", listStyleType: "decimal" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ margin: "0.2em 0", color: "var(--text-primary)", lineHeight: "1.7" }}>
      {children}
    </li>
  ),
  h1: ({ children }) => (
    <h1 style={{ fontSize: "1.1em", fontWeight: 700, margin: "0.75em 0 0.4em", color: "var(--text-primary)" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: "1em", fontWeight: 700, margin: "0.75em 0 0.4em", color: "var(--text-primary)" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: "0.95em", fontWeight: 600, margin: "0.6em 0 0.3em", color: "var(--accent)" }}>
      {children}
    </h3>
  ),
  code: ({ children }) => (
    <code
      style={{
        fontFamily: "monospace",
        fontSize: "0.85em",
        padding: "0.1em 0.4em",
        borderRadius: "4px",
        backgroundColor: "var(--bg-elevated)",
        color: "var(--accent)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: "2px solid var(--border-bright)",
        paddingLeft: "0.75em",
        margin: "0.5em 0",
        color: "var(--text-secondary)",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.75em 0" }} />
  ),
};

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div
          className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            backgroundColor: "var(--user-bubble)",
            border: "1px solid var(--user-bubble-border)",
            borderBottomRightRadius: "4px",
            color: "var(--text-primary)",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div
        className="max-w-[85%] flex flex-col gap-2 pl-4"
        style={{ borderLeft: "2px solid var(--accent)" }}
      >
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--accent)" }}
        >
          Scout
        </span>

        {message.toolCalls && message.toolCalls.map((tc, idx) => (
          <ToolCallBadge key={idx} status={tc.status} query={tc.query} />
        ))}

        <div className="text-sm" style={{ color: "var(--text-primary)" }}>
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
