import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

interface TimeOption {
  label: string;
  hours: number;
  minutes: number;
}

function makeRound() {
  const type = Math.random() < 0.6 ? "full" : "half";
  const h = Math.floor(Math.random() * 12) + 1;
  const m = type === "full" ? 0 : 30;
  const correct: TimeOption = { label: type === "full" ? `${h}:00` : `${h}:30`, hours: h, minutes: m };

  const options: TimeOption[] = [correct];
  const used = new Set([`${h}-${m}`]);
  while (options.length < 3) {
    const oh = Math.floor(Math.random() * 12) + 1;
    const om = Math.random() < 0.5 ? 0 : 30;
    const key = `${oh}-${om}`;
    if (!used.has(key)) {
      used.add(key);
      options.push({ label: om === 0 ? `${oh}:00` : `${oh}:30`, hours: oh, minutes: om });
    }
  }
  return { correct, options: options.sort(() => Math.random() - 0.5) };
}

function ClockFace({ hours, minutes }: { hours: number; minutes: number }) {
  const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
  const minAngle = minutes * 6 - 90;
  const toXY = (angle: number, r: number) => ({
    x: 100 + r * Math.cos((angle * Math.PI) / 180),
    y: 100 + r * Math.sin((angle * Math.PI) / 180),
  });
  const hourEnd = toXY(hourAngle, 48);
  const minEnd = toXY(minAngle, 68);

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
      <circle cx="100" cy="100" r="95" fill="white" stroke="#6D28D9" strokeWidth="5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = i * 30 - 90;
        const p1 = toXY(a, 78);
        const p2 = toXY(a, 90);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" />;
      })}
      {[3, 6, 9, 12].map((n) => {
        const a = n * 30 - 90;
        const p = toXY(a, 68);
        return (
          <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="bold" fill="#4C1D95">
            {n}
          </text>
        );
      })}
      {/* Hour hand */}
      <line x1="100" y1="100" x2={hourEnd.x} y2={hourEnd.y} stroke="#1E1B4B" strokeWidth="8" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="100" y1="100" x2={minEnd.x} y2={minEnd.y} stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#1E1B4B" />
    </svg>
  );
}

export default function ClockGame({ onScore, onCelebrate }: GameProps) {
  const [round, setRound] = useState(makeRound);
  const [wrongLabel, setWrongLabel] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextRound = useCallback(() => {
    setRound(makeRound());
    setWrongLabel(null);
    setCorrect(false);
  }, []);

  const handleChoice = (opt: TimeOption) => {
    if (correct) return;
    if (opt.label === round.correct.label) {
      setCorrect(true);
      recordResult("clock", true);
      playCorrect();
      onScore(15);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 3 === 0) {
        playCelebrate();
        onCelebrate();
      }
      setTimeout(nextRound, 1300);
    } else {
      recordResult("clock", false);
      playWrong();
      setWrongLabel(opt.label);
      setTimeout(() => setWrongLabel(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <p className="text-2xl font-black text-gray-700">Vad är klockan?</p>

      <div className="bg-purple-50 rounded-3xl p-4 border-4 border-purple-200 shadow-inner">
        <ClockFace hours={round.correct.hours} minutes={round.correct.minutes} />
      </div>

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">
          ⭐ Rätt! Klockan är {round.correct.label}! ⭐
        </div>
      )}
      {wrongLabel && !correct && (
        <p className="text-xl font-bold text-orange-500">Titta på klockans visare! 😊</p>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {round.options.map((opt) => {
          const isWrong = wrongLabel === opt.label;
          const isCorrect = correct && opt.label === round.correct.label;
          return (
            <button
              key={opt.label}
              onClick={() => handleChoice(opt)}
              className="w-28 h-20 rounded-3xl text-2xl font-black shadow-xl border-4 transition-all active:scale-90"
              style={{
                backgroundColor: isCorrect ? "#DCFCE7" : isWrong ? "#FEE2E2" : "#F5F3FF",
                borderColor: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "#DDD6FE",
                color: isCorrect ? "#15803D" : isWrong ? "#DC2626" : "#4C1D95",
                transform: isWrong ? "scale(0.88)" : undefined,
              }}
            >
              {opt.label}
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
