interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  const questions = [
    "When does Brazil play their first match? ",
    "Which airports should I fly into to see England play? ️",
    "Find teams that play like Spain's possession football ",
    "If Argentina finish 2nd in their group, where do they play next? "
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto mt-8">
      <h3 className="text-sm font-medium text-zinc-400 px-2">Try asking Scout:</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left text-sm px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 rounded-xl transition-all text-zinc-300"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
