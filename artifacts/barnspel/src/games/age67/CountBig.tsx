import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { useApp } from "@/context/AppContext";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

export default function CountBig({ onScore, onCelebrate, onStickerEarned }: GameProps) {
  const { theme } = useApp();
  const [correctStreak, setCorrectStreak] = useState(0);

  function makeRound() {
    const n = Math.floor(Math.random() * 18) + 3; // 3–20
    const opts = new Set<number>([n]);
    while (opts.size < 3) {
      const off = Math.floor(Math.random() * 4) + 1;
      const candidate = Math.random() < 0.5 ? n - off : n + off;
      if (candidate > 0 && candidate <= 22) opts.add(candidate);
    }
    return { n, opts: [...opts].sort(() => Math.random() - 0.5) };
  }

  const [round, setRound] = useState(makeRound);
  const [wrongNum, setWrongNum] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);

  const actor = theme.actors[0];

  const nextRound = useCallback(() => {
    setRound(makeRound());
    setWrongNum(null);
    setCorrect(false);
  }, []);

  const handleChoice = (n: number) => {
    if (correct) return;
    if (n === round.n) {
      setCorrect(true);
      recordResult("countBig", true);
      playCorrect();
      onScore(15);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      if (newStreak % 3 === 0) {
        playCelebrate();
        onCelebrate();
        onStickerEarned?.();
      }
      setTimeout(nextRound, 1300);
    } else {
      recordResult("countBig", false);
      playWrong();
      setWrongNum(n);
      setTimeout(() => setWrongNum(null), 600);
    }
  };

  // Render dots in a tidy grid of rows of 5
  const rows: number[] = [];
  let remaining = round.n;
  while (remaining > 0) {
    rows.push(Math.min(5, remaining));
    remaining -= 5;
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <p className="text-2xl font-black text-gray-800 text-center">Hur många ser du?</p>

      <div className="bg-slate-50 rounded-3xl border-4 border-blue-100 p-4 w-full max-w-xs">
        <div className="flex flex-col gap-2 items-center">
          {rows.map((count, ri) => (
            <div key={ri} className="flex gap-1 justify-center">
              {Array.from({ length: count }).map((_, ci) => (
                <span key={ci} className="text-4xl leading-none">{actor}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-lg font-black text-blue-700">
          {Array.from({ length: round.n }, (_, i) => i + 1).join(" ")}
        </div>
      </div>

      {correct && (
        <div className="text-3xl font-black text-green-500 animate-bounce-in">
          ⭐ Rätt! Det är {round.n}! ⭐
        </div>
      )}
      {wrongNum !== null && (
        <p className="text-xl font-bold text-orange-500">Räkna igen! 😊</p>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {round.opts.map((n) => {
          const isWrong = wrongNum === n;
          const isCorrect = correct && n === round.n;
          return (
            <button
              key={n}
              onClick={() => handleChoice(n)}
              className="w-24 h-24 rounded-3xl text-white text-4xl font-black shadow-xl border-4 transition-all active:scale-90"
              style={{
                background: isCorrect
                  ? "linear-gradient(135deg,#22C55E,#16A34A)"
                  : isWrong
                  ? "linear-gradient(135deg,#EF4444,#DC2626)"
                  : "linear-gradient(135deg,#60A5FA,#3B82F6)",
                borderColor: isWrong ? "#FF0000" : isCorrect ? "#FFD700" : "#BFDBFE",
                transform: isWrong ? "scale(0.88)" : undefined,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {correctStreak > 0 && !correct && (
        <p className="text-purple-500 font-bold">⭐ Bra jobbat!</p>
      )}
    </div>
  );
}
