import { useState, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

interface LetterEntry {
  letter: string;
  word: string;
  emoji: string;
}

const LETTERS: LetterEntry[] = [
  { letter: "A", word: "Äpple",    emoji: "🍎" },
  { letter: "B", word: "Björn",    emoji: "🐻" },
  { letter: "D", word: "Delfin",   emoji: "🐬" },
  { letter: "E", word: "Elefant",  emoji: "🐘" },
  { letter: "F", word: "Fisk",     emoji: "🐟" },
  { letter: "G", word: "Groda",    emoji: "🐸" },
  { letter: "H", word: "Häst",     emoji: "🐴" },
  { letter: "J", word: "Jordgubbe",emoji: "🍓" },
  { letter: "K", word: "Katt",     emoji: "🐱" },
  { letter: "L", word: "Lejon",    emoji: "🦁" },
  { letter: "M", word: "Myra",     emoji: "🐜" },
  { letter: "O", word: "Orm",      emoji: "🐍" },
  { letter: "P", word: "Pingvin",  emoji: "🐧" },
  { letter: "R", word: "Räv",      emoji: "🦊" },
  { letter: "S", word: "Sol",      emoji: "☀️" },
  { letter: "T", word: "Tiger",    emoji: "🐯" },
  { letter: "U", word: "Uggla",    emoji: "🦉" },
  { letter: "V", word: "Varg",     emoji: "🐺" },
];

function makeRound() {
  const shuffled = [...LETTERS].sort(() => Math.random() - 0.5);
  const correct = shuffled[0];
  const distractors = shuffled.slice(1, 3);
  const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { correct, opts };
}

export default function LetterMatch({ onScore, onCelebrate, onStickerEarned }: GameProps) {
  const [round, setRound] = useState(makeRound);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextRound = useCallback(() => {
    setRound(makeRound());
    setWrongLetter(null);
    setCorrect(false);
  }, []);

  const handleChoice = (entry: LetterEntry) => {
    if (correct) return;
    if (entry.letter === round.correct.letter) {
      setCorrect(true);
      recordResult("letters", true);
      playCorrect();
      onScore(15);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 3 === 0) {
        playCelebrate();
        onCelebrate();
        onStickerEarned?.();
      }
      setTimeout(nextRound, 1300);
    } else {
      recordResult("letters", false);
      playWrong();
      setWrongLetter(entry.letter);
      setTimeout(() => setWrongLetter(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-7 px-4 py-6">
      <div className="text-center">
        <p className="text-xl font-black text-gray-700 mb-2">
          Vilket ord börjar på...
        </p>
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-purple-300 mx-auto">
          <span className="text-7xl font-black text-white drop-shadow">{round.correct.letter}</span>
        </div>
      </div>

      {correct && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in text-center">
          ⭐ {round.correct.word}! Rätt! ⭐
        </div>
      )}
      {wrongLetter && !correct && (
        <p className="text-xl font-bold text-orange-500">Prova igen! 😊</p>
      )}

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {round.opts.map((entry) => {
          const isWrong = wrongLetter === entry.letter;
          const isCorrect = correct && entry.letter === round.correct.letter;
          return (
            <button
              key={entry.letter}
              onClick={() => handleChoice(entry)}
              className="flex flex-col items-center gap-1 py-4 rounded-3xl border-4 shadow-lg transition-all active:scale-90"
              style={{
                backgroundColor: isCorrect ? "#DCFCE7" : isWrong ? "#FEE2E2" : "#FAFAFA",
                borderColor: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "#E9D5FF",
                transform: isWrong ? "scale(0.88)" : undefined,
              }}
            >
              <span className="text-5xl">{entry.emoji}</span>
              <span className="text-xs font-bold text-gray-600">{entry.word}</span>
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
