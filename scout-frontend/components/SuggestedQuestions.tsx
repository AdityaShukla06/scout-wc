interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const questions = [
  {
    icon: "BR",
    flag: true,
    text: "When does Brazil play their first match?",
  },
  {
    icon: "✈",
    flag: false,
    text: "Airports for England's group stage games?",
  },
  {
    icon: "◎",
    flag: false,
    text: "Teams that play like Spain's possession style",
  },
  {
    icon: "★",
    flag: false,
    text: "If Argentina finish 2nd, where do they play next?",
  },
];

export default function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-4 text-center"
        style={{ color: "var(--text-dim)" }}
      >
        Try asking
      </p>
      <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.text)}
            className="text-left rounded-xl transition-all duration-200 group"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              padding: "16px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--border-bright)";
              el.style.backgroundColor = "var(--bg-hover)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--border)";
              el.style.backgroundColor = "var(--bg-surface)";
              el.style.transform = "translateY(0)";
            }}
          >
            <div
              className="text-lg mb-2 font-mono font-bold"
              style={{ color: "var(--accent)" }}
            >
              {q.icon}
            </div>
            <p
              className="text-sm leading-snug"
              style={{ color: "var(--text-secondary)" }}
            >
              {q.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
