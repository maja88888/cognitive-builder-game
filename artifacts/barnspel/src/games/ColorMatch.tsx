import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

const COLORS = [
  { name: "Röd",    value: "#EF4444" },
  { name: "Blå",    value: "#3B82F6" },
  { name: "Gul",    value: "#EAB308" },
  { name: "Grön",   value: "#22C55E" },
  { name: "Orange", value: "#F97316" },
  { name: "Lila",   value: "#A855F7" },
];

export default function ColorMatch({ onScore, onCelebrate }: GameProps) {
  const makeRound = useCallback(() => {
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wrong = COLORS.filter((c) => c.name !== t.name).sort(() => Math.random() - 0.5).slice(0, 2);
    return { target: t, opts: [t, ...wrong].sort(() => Math.random() - 0.5) };
  }, []);

  const [round, setRound] = useState(makeRound);
  const [wrongName, setWrongName] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);

  const next = useCallback(() => {
    setRound(makeRound());
    setWrongName(null);
    setCorrect(false);
  }, [makeRound]);

  const handleChoice = (color: typeof COLORS[0]) => {
    if (correct) return;
    if (color.name === round.target.name) {
      setCorrect(true);
      recordResult("colors", true);
      playCorrect();
      onScore(10);
      onCelebrate();
      playCelebrate();
      setTimeout(next, 1200);
    } else {
      recordResult("colors", false);
      playWrong();
      setWrongName(color.name);
      setTimeout(() => setWrongName(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">Tryck på den som är</p>
        <div
          className="mt-4 px-10 py-4 rounded-3xl text-white text-4xl font-black shadow-xl"
          style={{ backgroundColor: round.target.value }}
        >
          {round.target.name}
        </div>
      </div>

      {correct && (
        <div className="text-4xl font-black text-green-500 animate-bounce-in">⭐ Rätt! ⭐</div>
      )}

      <div className="grid grid-cols-3 gap-5 w-full max-w-xs">
        {round.opts.map((color) => {
          const isWrong = wrongName === color.name;
          const isCorrectSel = correct && color.name === round.target.name;
          return (
            <button
              key={color.name}
              onClick={() => handleChoice(color)}
              className="aspect-square rounded-3xl shadow-lg border-[6px] transition-all duration-150 active:scale-90"
              style={{
                backgroundColor: color.value,
                borderColor: isCorrectSel ? "#FFD700" : isWrong ? "#FF0000" : "white",
                transform: isWrong ? "scale(0.88)" : undefined,
                boxShadow: isWrong ? "0 0 0 4px #FF000055" : undefined,
              }}
            />
          );
        })}
      </div>

      {wrongName && (
        <p className="text-xl font-bold text-orange-500">Prova igen! 😊</p>
      )}
    </div>
  );
}
