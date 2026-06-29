import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

interface WordEntry {
  swedish: string;
  english: string;
  emoji: string;
}

const WORDS: WordEntry[] = [
  { swedish: "Katt",     english: "Cat",      emoji: "🐱" },
  { swedish: "Hund",     english: "Dog",      emoji: "🐶" },
  { swedish: "Häst",     english: "Horse",    emoji: "🐴" },
  { swedish: "Fisk",     english: "Fish",     emoji: "🐟" },
  { swedish: "Fågel",    english: "Bird",     emoji: "🐦" },
  { swedish: "Äpple",    english: "Apple",    emoji: "🍎" },
  { swedish: "Banan",    english: "Banana",   emoji: "🍌" },
  { swedish: "Sol",      english: "Sun",      emoji: "☀️" },
  { swedish: "Måne",     english: "Moon",     emoji: "🌙" },
  { swedish: "Stjärna",  english: "Star",     emoji: "⭐" },
  { swedish: "Bil",      english: "Car",      emoji: "🚗" },
  { swedish: "Tåg",      english: "Train",    emoji: "🚂" },
  { swedish: "Båt",      english: "Boat",     emoji: "🚢" },
  { swedish: "Hus",      english: "House",    emoji: "🏠" },
  { swedish: "Bok",      english: "Book",     emoji: "📚" },
  { swedish: "Boll",     english: "Ball",     emoji: "⚽" },
  { swedish: "Blomma",   english: "Flower",   emoji: "🌸" },
  { swedish: "Träd",     english: "Tree",     emoji: "🌳" },
  { swedish: "Hjärta",   english: "Heart",    emoji: "❤️" },
  { swedish: "Regnbåge", english: "Rainbow",  emoji: "🌈" },
];

function makeRound() {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  const correct = shuffled[0];
  const distractors = shuffled.slice(1, 3);
  const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
  // 50/50: either show Swedish word, pick English; or show emoji, pick English
  const showSwedish = Math.random() < 0.5;
  return { correct, opts, showSwedish };
}

export default function EnglishWords({ onScore, onCelebrate }: GameProps) {
  const [round, setRound] = useState(makeRound);
  const [wrongEng, setWrongEng] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextRound = useCallback(() => {
    setRound(makeRound());
    setWrongEng(null);
    setCorrect(false);
  }, []);

  const handleChoice = (entry: WordEntry) => {
    if (correct) return;
    if (entry.english === round.correct.english) {
      setCorrect(true);
      recordResult("english", true);
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
      recordResult("english", false);
      playWrong();
      setWrongEng(entry.english);
      setTimeout(() => setWrongEng(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <p className="text-2xl font-black text-gray-700 text-center">
        Vad heter det på engelska?
      </p>

      {/* Prompt */}
      <div className="bg-indigo-50 rounded-3xl border-4 border-indigo-200 p-6 flex flex-col items-center gap-2 shadow-inner">
        <span className="text-7xl">{round.correct.emoji}</span>
        {round.showSwedish && (
          <span className="text-2xl font-black text-indigo-800">{round.correct.swedish}</span>
        )}
      </div>

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">
          ⭐ {round.correct.english}! Rätt! ⭐
        </div>
      )}
      {wrongEng && !correct && (
        <p className="text-xl font-bold text-orange-500">Prova igen! 😊</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {round.opts.map((entry) => {
          const isWrong = wrongEng === entry.english;
          const isCorrect = correct && entry.english === round.correct.english;
          return (
            <button
              key={entry.english}
              onClick={() => handleChoice(entry)}
              className="w-full py-4 rounded-3xl text-xl font-black shadow-lg border-4 transition-all active:scale-95"
              style={{
                backgroundColor: isCorrect ? "#DCFCE7" : isWrong ? "#FEE2E2" : "#EEF2FF",
                borderColor: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "#C7D2FE",
                color: isCorrect ? "#15803D" : isWrong ? "#DC2626" : "#3730A3",
                transform: isWrong ? "scale(0.96)" : undefined,
              }}
            >
              {entry.english}
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
