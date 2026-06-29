import { useState, useCallback, useEffect, useRef } from "react";
import { recordResult } from "@/lib/progress";
import { useApp } from "@/context/AppContext";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

const TOTAL_QUESTIONS = 10;

function makeQuestion() {
  const isAdd = Math.random() < 0.55;
  if (isAdd) {
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * (20 - a)) + 1;
    const answer = a + b;
    const opts = new Set<number>([answer]);
    while (opts.size < 3) {
      const off = Math.floor(Math.random() * 4) + 1;
      const c = answer + (Math.random() < 0.5 ? off : -off);
      if (c > 0) opts.add(c);
    }
    return { expr: `${a} + ${b}`, answer, opts: [...opts].sort(() => Math.random() - 0.5) };
  } else {
    const b = Math.floor(Math.random() * 10) + 1;
    const a = b + Math.floor(Math.random() * 10) + 1;
    const answer = a - b;
    const opts = new Set<number>([answer]);
    while (opts.size < 3) {
      const off = Math.floor(Math.random() * 4) + 1;
      const c = answer + (Math.random() < 0.5 ? off : -off);
      if (c >= 0) opts.add(c);
    }
    return { expr: `${a} − ${b}`, answer, opts: [...opts].sort(() => Math.random() - 0.5) };
  }
}

export default function MathPlus({ onScore, onCelebrate }: GameProps) {
  const { personalBest, updatePersonalBest } = useApp();
  const [question, setQuestion] = useState(makeQuestion);
  const [wrongNum, setWrongNum] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime]);

  const nextQuestion = useCallback(() => {
    setQuestion(makeQuestion());
    setWrongNum(null);
    setCorrect(false);
  }, []);

  const handleChoice = (n: number) => {
    if (correct || done) return;
    if (n === question.answer) {
      setCorrect(true);
      recordResult("math", true);
      playCorrect();
      onScore(10);
      const newAnswered = answered + 1;
      setAnswered(newAnswered);
      if (newAnswered >= TOTAL_QUESTIONS) {
        if (timerRef.current) clearInterval(timerRef.current);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(finalTime);
        updatePersonalBest(finalTime);
        playCelebrate();
        onCelebrate();
        setDone(true);
      } else {
        setTimeout(nextQuestion, 1000);
      }
    } else {
      recordResult("math", false);
      playWrong();
      setWrongNum(n);
      setTimeout(() => setWrongNum(null), 600);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-10 text-center">
        <div className="text-5xl animate-bounce-in">🏆</div>
        <p className="text-3xl font-black text-green-600">Klart!</p>
        <div className="bg-slate-50 rounded-3xl p-6 w-full max-w-xs">
          <div className="text-2xl font-black text-purple-700">{elapsed} sekunder</div>
          <div className="text-sm text-gray-500 mt-1">
            {personalBest === elapsed ? "🎉 Nytt rekord!" : `Bästa: ${personalBest}s`}
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-purple-600 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95"
        >
          Spela igen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      {/* Progress + timer */}
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-sm font-bold text-gray-500">
          Fråga {answered + 1}/{TOTAL_QUESTIONS}
        </div>
        <div className="text-sm font-bold text-purple-600">⏱ {elapsed}s</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${(answered / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      {/* Equation */}
      <div className="w-full max-w-xs bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-8 text-center border-4 border-purple-200 shadow-inner">
        <div className="text-5xl font-black text-indigo-800">{question.expr} = ?</div>
      </div>

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">⭐ Rätt!</div>
      )}
      {wrongNum !== null && (
        <p className="text-xl font-bold text-purple-400">Prova igen! 😊</p>
      )}

      <div className="flex gap-4 justify-center">
        {question.opts.map((n) => {
          const isWrong = wrongNum === n;
          const isCorrect = correct && n === question.answer;
          return (
            <button
              key={n}
              onClick={() => handleChoice(n)}
              className="w-24 h-24 rounded-3xl text-4xl font-black shadow-xl border-4 transition-all active:scale-90 text-white"
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
              {n}
            </button>
          );
        })}
      </div>

      {personalBest !== null && (
        <div className="text-xs text-gray-400">Bästa: 🏆 {personalBest}s för {TOTAL_QUESTIONS} frågor</div>
      )}
    </div>
  );
}
