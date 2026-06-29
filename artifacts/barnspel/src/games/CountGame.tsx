import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { useApp } from "@/context/AppContext";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

export default function CountGame({ onScore, onCelebrate }: GameProps) {
  const { theme } = useApp();

  const makeRound = useCallback(() => {
    const c = Math.floor(Math.random() * 5) + 1;
    const actor = theme.actors[Math.floor(Math.random() * Math.min(4, theme.actors.length))];
    const wrong1 = c === 1 ? 2 : c - 1;
    const wrong2 = c === 5 ? 4 : c + 1;
    return { c, actor, opts: [c, wrong1, wrong2].sort(() => Math.random() - 0.5) };
  }, [theme.actors]);

  const [round, setRound] = useState(makeRound);
  const [wrongNum, setWrongNum] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>(Array(round.c).fill(false));

  const next = useCallback(() => {
    const r = makeRound();
    setRound(r);
    setWrongNum(null);
    setCorrect(false);
    const rev = Array(r.c).fill(false);
    setRevealed(rev);
    for (let i = 0; i < r.c; i++) {
      setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 250 + 300);
    }
  }, [makeRound]);

  const handleChoice = (n: number) => {
    if (correct) return;
    if (n === round.c) {
      setCorrect(true);
      recordResult("count", true);
      playCorrect();
      onScore(10);
      onCelebrate();
      playCelebrate();
      setTimeout(next, 1400);
    } else {
      recordResult("count", false);
      playWrong();
      setWrongNum(n);
      setTimeout(() => setWrongNum(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <p className="text-2xl font-black text-gray-700 text-center">Hur många ser du?</p>

      <div
        className="flex flex-wrap justify-center items-center gap-3 rounded-3xl p-5 border-4 border-blue-100 bg-blue-50 w-full max-w-xs"
        style={{ minHeight: "120px" }}
      >
        {Array.from({ length: round.c }).map((_, i) => (
          <span
            key={i}
            className="text-5xl transition-all duration-300"
            style={{ opacity: revealed[i] ? 1 : 0, transform: revealed[i] ? "scale(1)" : "scale(0.1)" }}
          >
            {round.actor}
          </span>
        ))}
      </div>

      {correct && (
        <div className="text-3xl font-black text-green-500 animate-bounce-in">⭐ Ja! Det är {round.c}! ⭐</div>
      )}
      {wrongNum !== null && !correct && (
        <p className="text-xl font-bold text-orange-500">Räkna igen! 😊</p>
      )}

      <div className="game-answer-row">
        {round.opts.map((n) => {
          const isWrong = wrongNum === n;
          const isCorrect = correct && n === round.c;
          return (
            <button
              key={n}
              onClick={() => handleChoice(n)}
              className="w-24 h-24 rounded-3xl text-white text-5xl font-black shadow-xl border-4 transition-all active:scale-90"
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
    </div>
  );
}
