export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-4 bg-zinc-800 rounded-2xl w-fit rounded-tl-none">
      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
    </div>
  );
}
