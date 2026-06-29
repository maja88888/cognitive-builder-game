import { useState, useEffect, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { useApp } from "@/context/AppContext";

const SHAPES = [
  { emoji: "🔴" }, { emoji: "🔵" }, { emoji: "🟡" }, { emoji: "🟢" },
  { emoji: "⭐" }, { emoji: "🌙" }, { emoji: "❤️" }, { emoji: "🔷" },
];

type Level = "easy" | "medium";

function makePattern(lvl: Level) {
  const picked = [...SHAPES].sort(() => Math.random() - 0.5);
  if (lvl === "easy") {
    // AB pattern — simple 2-item repeat, show 4 items then ?
    const [a, b] = picked;
    const sequence = [a.emoji, b.emoji, a.emoji, b.emoji];
    const answer = a.emoji;
    const distractors = picked.slice(2, 4).map((s) => s.emoji);
    return { sequence, answer, distractors };
  } else {
    // ABB pattern — show 6 items then ?
    const [a, b] = picked;
    const sequence = [a.emoji, b.emoji, b.emoji, a.emoji, b.emoji, b.emoji];
    const answer = a.emoji;
    const distractors = picked.slice(2, 4).map((s) => s.emoji);
    return { sequence, answer, distractors };
  }
}

interface Props {
  onScore: (points: number) => void;
  onCelebrate: () => void;
}

export default function PatternGame({ onScore, onCelebrate }: Props) {
  const { ageGroup } = useApp();
  const [level, setLevel] = useState<Level>("easy");
  const [pattern, setPattern] = useState(() => makePattern("easy"));
  const [options, setOptions] = useState<string[]>([]);
  const [wrongEmoji, setWrongEmoji] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const generateRound = useCallback((lvl: Level) => {
    const p = makePattern(lvl);
    setPattern(p);
    setOptions([p.answer, ...p.distractors].sort(() => Math.random() - 0.5));
    setWrongEmoji(null);
    setCorrect(false);
  }, []);

  useEffect(() => { generateRound("easy"); }, [generateRound]);

  const handleChoice = (emoji: string) => {
    if (correct) return;
    if (emoji === pattern.answer) {
      setCorrect(true);
      recordResult("pattern", true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      onScore(level === "easy" ? 10 : 15);
      onCelebrate();
      setTimeout(() => {
        const nextLevel: Level = newStreak >= 4 ? "medium" : "easy";
        setLevel(nextLevel);
        generateRound(nextLevel);
      }, 1300);
    } else {
      recordResult("pattern", false);
      setWrongEmoji(emoji);
      setTimeout(() => setWrongEmoji(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-7 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">Vad kommer härnäst?</p>
      </div>

      {/* Pattern row */}
      <div className="flex items-center gap-2 flex-wrap justify-center bg-white rounded-3xl p-4 border-4 border-purple-100 shadow-inner w-full max-w-xs">
        {pattern.sequence.map((emoji, i) => (
          <span key={i} className="text-5xl">{emoji}</span>
        ))}
        {/* Animated question box */}
        <span className="text-4xl w-14 h-14 flex items-center justify-center bg-yellow-50 border-4 border-yellow-300 rounded-2xl animate-glow-pulse">
          ❓
        </span>
      </div>

      {correct && (
        <div className="text-3xl font-black text-green-500 animate-bounce-in">
          ⭐ Precis rätt! ⭐
        </div>
      )}
      {wrongEmoji && !correct && (
        <p className="text-xl font-bold text-orange-500">Titta noga igen! 😊</p>
      )}

      {/* Answer options */}
      <div className="game-answer-row">
        {options.map((emoji, i) => {
          const isWrong = wrongEmoji === emoji;
          const isCorrect = correct && emoji === pattern.answer;
          return (
            <button
              key={i}
              onClick={() => handleChoice(emoji)}
              className="w-24 h-24 rounded-3xl shadow-xl border-4 flex items-center justify-center text-5xl transition-all duration-150 active:scale-90"
              style={{
                backgroundColor: isCorrect ? "#DCFCE7" : isWrong ? "#FEE2E2" : "#FAFAFA",
                borderColor: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "#E9D5FF",
                transform: isWrong ? "scale(0.88)" : undefined,
                boxShadow: isWrong ? "0 0 0 4px #EF444466" : undefined,
              }}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {streak >= 2 && !correct && ageGroup !== "35" && (
        <div className="text-purple-500 font-bold animate-float">
          ⭐ Bra jobbat!
        </div>
      )}
    </div>
  );
}
