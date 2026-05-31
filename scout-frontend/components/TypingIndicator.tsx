export default function TypingIndicator() {
  return (
    <div
      className="flex flex-col gap-2 pl-4"
      style={{ borderLeft: "2px solid var(--accent)" }}
    >
      <span
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: "var(--accent)" }}
      >
        Scout
      </span>
      <div className="flex items-end gap-1 h-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-0.5 rounded-full"
            style={{
              backgroundColor: "var(--accent)",
              height: "100%",
              animation: `waveBar 0.9s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>
    </div>
  );
}
