import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";

const CATEGORIES = [
  {
    name: "Djur",
    emoji: "🐾",
    bg: "from-emerald-400 to-green-500",
    items: ["🐱", "🐶", "🐸", "🐥", "🐰", "🦊", "🐻", "🐼"],
  },
  {
    name: "Mat",
    emoji: "🍽️",
    bg: "from-orange-400 to-red-400",
    items: ["🍎", "🍌", "🍓", "🍕", "🍦", "🍩", "🥕", "🍇"],
  },
  {
    name: "Fordon",
    emoji: "🚗",
    bg: "from-blue-400 to-indigo-500",
    items: ["🚗", "🚀", "✈️", "🚂", "🚢", "🚁", "🛵", "🚲"],
  },
];

interface Props {
  onScore: (points: number) => void;
  onCelebrate: () => void;
}

function getItem() {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const emoji = cat.items[Math.floor(Math.random() * cat.items.length)];
  return { emoji, categoryName: cat.name };
}

export default function ShapeSort({ onScore, onCelebrate }: Props) {
  const [item, setItem] = useState(() => getItem());
  const [wrongCat, setWrongCat] = useState<string | null>(null);
  const [correctCat, setCorrectCat] = useState<string | null>(null);

  const handleDrop = useCallback((categoryName: string) => {
    if (correctCat) return;
    if (categoryName === item.categoryName) {
      setCorrectCat(categoryName);
      recordResult("sort", true);
      onScore(10);
      onCelebrate();
      setTimeout(() => {
        setItem(getItem());
        setCorrectCat(null);
        setWrongCat(null);
      }, 1100);
    } else {
      recordResult("sort", false);
      setWrongCat(categoryName);
      setTimeout(() => setWrongCat(null), 600);
    }
  }, [correctCat, item, onScore, onCelebrate]);

  return (
    <div className="flex flex-col items-center gap-7 px-4 py-6">
      <p className="text-2xl font-black text-gray-700 text-center">
        Var hör den hemma?
      </p>

      {/* Item to sort */}
      <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 flex items-center justify-center animate-float">
        <span className="text-8xl">{item.emoji}</span>
      </div>

      {correctCat && (
        <div className="text-3xl font-black text-green-500 animate-bounce-in">
          ⭐ Rätt! ⭐
        </div>
      )}
      {wrongCat && !correctCat && (
        <p className="text-xl font-bold text-orange-500">Prova en annan! 😊</p>
      )}

      {/* Category bins */}
      <div className="flex flex-wrap gap-4 justify-center">
        {CATEGORIES.map((cat) => {
          const isWrong = wrongCat === cat.name;
          const isCorrect = correctCat === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => handleDrop(cat.name)}
              className={`flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-3xl bg-gradient-to-br ${cat.bg} text-white shadow-xl border-4 transition-all duration-150 active:scale-90`}
              style={{
                borderColor: isCorrect ? "#FFD700" : isWrong ? "#EF4444" : "white",
                transform: isWrong ? "scale(0.88)" : isCorrect ? "scale(1.05)" : undefined,
                boxShadow: isWrong ? "0 0 0 4px #EF444466" : undefined,
              }}
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-black text-base drop-shadow">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
