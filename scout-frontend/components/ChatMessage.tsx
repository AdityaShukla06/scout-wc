import { Message } from "@/lib/types";
import { clsx } from "clsx";
import ToolCallBadge from "./ToolCallBadge";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("flex max-w-[85%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        
        {!isUser && message.toolCalls && message.toolCalls.map((tc, idx) => (
          <ToolCallBadge key={idx} status={tc.status} query={tc.query} />
        ))}

        <div className={clsx(
          "px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed",
          isUser 
            ? "bg-emerald-600 text-white rounded-tr-none" 
            : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/50"
        )}>
          {!isUser && <span className="mr-2"></span>}
          {message.content}
        </div>
      </div>
    </div>
  );
}
