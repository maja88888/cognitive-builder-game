import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

type PuzzleType = "sequence" | "oddone" | "analogy";

interface Puzzle {
  type: PuzzleType;
  question: string;
  sequence?: (string | number)[];
  answer: string | number;
  opts: (string | number)[];
  hint?: string;
}

function makeSequence(): Puzzle {
  const patterns = [
    () => { const s = Math.floor(Math.random() * 5) + 1; const a = Math.floor(Math.random() * 3) + 1; return { seq: [a, a+s, a+2*s, a+3*s], answer: a+4*s }; },
    () => { const a = Math.floor(Math.random() * 3) + 2; const b = Math.floor(Math.random() * 10) + 10; return { seq: [b, b-a, b-2*a, b-3*a], answer: b-4*a }; },
    () => { const a = Math.floor(Math.random() * 3) + 2; return { seq: [a, a*2, a*4, a*8], answer: a*16 }; },
  ];
  const p = patterns[Math.floor(Math.random() * patterns.length)]();
  const answer = p.answer;
  const opts = new Set<number>([answer]);
  while (opts.size < 3) {
    const off = Math.floor(Math.random() * 5) + 1;
    const c = answer + (Math.random() < 0.5 ? off : -off);
    if (c > 0) opts.add(c);
  }
  const seqStr = p.seq.map(String);
  seqStr.push("?");
  return {
    type: "sequence",
    question: "Vilket tal kommer härnäst?",
    sequence: p.seq,
    answer,
    opts: [...opts].sort(() => Math.random() - 0.5),
    hint: "Titta på hur talen ändras steg för steg.",
  };
}

function makeOddOne(): Puzzle {
  const groups = [
    { items: ["🐱","🐶","🐻","🚗"], odd: "🚗", reason: "inte ett djur" },
    { items: ["🍎","🍌","🍓","✈️"], odd: "✈️", reason: "inte mat" },
    { items: ["🚗","🚂","🛵","🌸"], odd: "🌸", reason: "inte ett fordon" },
    { items: ["☀️","🌙","⭐","🍕"], odd: "🍕", reason: "inte på himlen" },
    { items: ["1","3","5","4"], odd: "4", reason: "inte ett udda tal" },
    { items: ["2","4","6","7"], odd: "7", reason: "inte ett jämnt tal" },
    { items: ["🔴","🔵","🟡","🏠"], odd: "🏠", reason: "inte en färg/form" },
  ];
  const g = groups[Math.floor(Math.random() * groups.length)];
  return {
    type: "oddone",
    question: "Vilket hör INTE ihop med de andra?",
    sequence: g.items,
    answer: g.odd,
    opts: [...g.items].sort(() => Math.random() - 0.5),
    hint: g.reason,
  };
}

function makeAnalogy(): Puzzle {
  const analogies = [
    { q: "🐱 → Katt   ·   🐶 → ?", answer: "Hund", opts: ["Hund","Katt","Fisk"] },
    { q: "☀️ → Dag   ·   🌙 → ?", answer: "Natt", opts: ["Natt","Dag","Kväll"] },
    { q: "2 + 2 = 4   ·   3 + 3 = ?", answer: "6", opts: ["5","6","7"] },
    { q: "10 − 5 = 5   ·   20 − 5 = ?", answer: "15", opts: ["14","15","16"] },
    { q: "Röd = 🔴   ·   Blå = ?", answer: "🔵", opts: ["🟡","🔵","🟢"] },
  ];
  const a = analogies[Math.floor(Math.random() * analogies.length)];
  return {
    type: "analogy",
    question: a.q,
    answer: a.answer,
    opts: [...a.opts].sort(() => Math.random() - 0.5),
  };
}

function makePuzzle(): Puzzle {
  const r = Math.random();
  if (r < 0.4) return makeSequence();
  if (r < 0.7) return makeOddOne();
  return makeAnalogy();
}

export default function LogicPuzzle({ onScore, onCelebrate }: GameProps) {
  const [puzzle, setPuzzle] = useState(makePuzzle);
  const [wrongOpt, setWrongOpt] = useState<string | number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const nextPuzzle = useCallback(() => {
    setPuzzle(makePuzzle());
    setWrongOpt(null);
    setCorrect(false);
    setShowHint(false);
  }, []);

  const handleChoice = (opt: string | number) => {
    if (correct) return;
    if (String(opt) === String(puzzle.answer)) {
      setCorrect(true);
      recordResult("logic", true);
      playCorrect();
      onScore(20);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 3 === 0) {
        playCelebrate();
        onCelebrate();
      }
      setTimeout(nextPuzzle, 1300);
    } else {
      recordResult("logic", false);
      playWrong();
      setWrongOpt(opt);
      setShowHint(true);
      setTimeout(() => setWrongOpt(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">{puzzle.question}</p>
        {puzzle.type === "sequence" && (
          <p className="text-xs text-gray-400 mt-1">Logikpussel</p>
        )}
      </div>

      {/* Sequence display */}
      {puzzle.sequence && (
        <div className="flex flex-wrap gap-3 justify-center bg-slate-50 rounded-3xl p-4 border-4 border-indigo-100 w-full max-w-xs">
          {puzzle.sequence.map((item, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-2xl bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center text-2xl font-black text-indigo-800"
              style={String(item) === "?" ? { backgroundColor: "#FEF9C3", borderColor: "#FDE047" } : {}}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {showHint && puzzle.hint && !correct && (
        <div className="text-sm text-indigo-600 bg-indigo-50 rounded-2xl px-4 py-2 text-center max-w-xs">
          💡 Tips: {puzzle.hint}
        </div>
      )}

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">⭐ Rätt! Bra tänkt! ⭐</div>
      )}
      {wrongOpt !== null && !correct && (
        <p className="text-xl font-bold text-orange-500">Titta noga! 😊</p>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {puzzle.opts.map((opt, i) => {
          const isWrong = wrongOpt !== null && String(wrongOpt) === String(opt);
          const isCorrect = correct && String(opt) === String(puzzle.answer);
          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              className="min-w-20 h-20 px-4 rounded-3xl text-2xl font-black shadow-xl border-4 transition-all active:scale-90 text-white"
              style={{
                background: isCorrect
                  ? "linear-gradient(135deg,#22C55E,#16A34A)"
                  : isWrong
                  ? "linear-gradient(135deg,#EF4444,#DC2626)"
                  : "linear-gradient(135deg,#818CF8,#6366F1)",
                borderColor: isWrong ? "#FF0000" : isCorrect ? "#FFD700" : "#C7D2FE",
                transform: isWrong ? "scale(0.88)" : undefined,
              }}
            >
              {opt}
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
