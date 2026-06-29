import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

const SHAPES = ["🔴","🔵","🟡","🟢","⭐","🌙","❤️","🔷","🟠","🟣"];

type PatternType = "ABAB" | "AABB" | "ABBC" | "ABCD";

function makePattern(type: PatternType) {
  const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
  let seq: string[];
  let answer: string;
  if (type === "ABAB") {
    const [a, b] = shuffled;
    seq = [a, b, a, b, a];
    answer = b;
  } else if (type === "AABB") {
    const [a, b] = shuffled;
    seq = [a, a, b, b, a, a];
    answer = b;
  } else if (type === "ABBC") {
    const [a, b, c] = shuffled;
    seq = [a, b, b, c, a, b, b];
    answer = c;
  } else {
    const [a, b, c, d] = shuffled;
    seq = [a, b, c, d, a, b, c];
    answer = d;
  }
  const distractors = shuffled.filter((s) => s !== answer).slice(0, 2);
  const opts = [answer, ...distractors].sort(() => Math.random() - 0.5);
  return { seq, answer, opts };
}

const LEVELS: PatternType[] = ["ABAB", "AABB", "ABBC", "ABCD"];

export default function PatternAdv({ onScore, onCelebrate, onStickerEarned }: GameProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [round, setRound] = useState(() => makePattern(LEVELS[0]));
  const [wrongEmoji, setWrongEmoji] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextRound = useCallback((idx: number) => {
    setRound(makePattern(LEVELS[idx]));
    setWrongEmoji(null);
    setCorrect(false);
  }, []);

  const handleChoice = (emoji: string) => {
    if (correct) return;
    if (emoji === round.answer) {
      setCorrect(true);
      recordResult("patternAdv", true);
      playCorrect();
      const pts = 10 + levelIdx * 5;
      onScore(pts);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 3 === 0) {
        playCelebrate();
        onCelebrate();
        onStickerEarned?.();
      }
      setTimeout(() => {
        const nextIdx = Math.min(levelIdx + (newStreak % 4 === 0 ? 1 : 0), LEVELS.length - 1);
        setLevelIdx(nextIdx);
        nextRound(nextIdx);
      }, 1200);
    } else {
      recordResult("patternAdv", false);
      playWrong();
      setWrongEmoji(emoji);
      setTimeout(() => setWrongEmoji(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">Vad kommer härnäst?</p>
      </div>

      {/* Pattern */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 rounded-3xl p-4 border-4 border-purple-100 w-full max-w-xs">
        {round.seq.map((e, i) => (
          <span key={i} className="text-5xl">{e}</span>
        ))}
        <span className="text-4xl w-14 h-14 flex items-center justify-center bg-yellow-50 border-4 border-yellow-300 rounded-2xl animate-glow-pulse">
          ❓
        </span>
      </div>

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">⭐ Rätt mönster! ⭐</div>
      )}
      {wrongEmoji && !correct && (
        <p className="text-xl font-bold text-orange-500">Titta noga! 😊</p>
      )}

      <div className="game-answer-row">
        {round.opts.map((e, i) => {
          const isWrong = wrongEmoji === e;
          const isCorrect = correct && e === round.answer;
          return (
            <button
              key={i}
              onClick={() => handleChoice(e)}
              className="w-24 h-24 rounded-3xl border-4 shadow-xl flex items-center justify-center text-5xl transition-all active:scale-90"
              style={{
                backgroundColor: isCorrect ? "#DCFCE7" : isWrong ? "#FEE2E2" : "#FAFAFA",
                borderColor: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "#E9D5FF",
                transform: isWrong ? "scale(0.88)" : undefined,
              }}
            >
              {e}
            </button>
          );
        })}
      </div>

      {streak >= 2 && !correct && (
        <p className="text-purple-500 font-bold animate-float">⭐ Bra jobbat!</p>
      )}
    </div>
  );
}
