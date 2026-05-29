import { clsx } from "clsx";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ToolCallBadgeProps {
  status: "loading" | "done";
  query?: string;
}

export default function ToolCallBadge({ status, query }: ToolCallBadgeProps) {
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-full w-fit mb-2 animate-pulse">
        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
        <span className="text-xs font-medium text-emerald-400"> Querying MongoDB...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full w-fit">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-medium text-zinc-400"> MongoDB query complete</span>
      </div>
      {query && <span className="text-[10px] text-zinc-600 px-3">{query}</span>}
    </div>
  );
}
