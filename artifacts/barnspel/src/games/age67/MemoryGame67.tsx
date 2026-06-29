import { useState, useEffect, useCallback } from "react";
import { recordResult } from "@/lib/progress";
import { useApp } from "@/context/AppContext";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sounds";
import type { GameProps } from "@/pages/GameHub";

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const TOTAL_PAIRS = 4;

export default function MemoryGame67({ onScore, onCelebrate, onStickerEarned }: GameProps) {
  const { theme } = useApp();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [pairs, setPairs] = useState(0);
  const [lastMatch, setLastMatch] = useState(false);

  const initGame = useCallback(() => {
    const emojis = theme.actors.slice(0, TOTAL_PAIRS);
    const doubled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(doubled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    setSelected([]);
    setLocked(false);
    setPairs(0);
    setLastMatch(false);
  }, [theme.actors]);

  useEffect(() => { initGame(); }, [initGame]);

  const handleFlip = (id: number) => {
    if (locked) return;
    const card = cards[id];
    if (card.flipped || card.matched || selected.length >= 2) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        recordResult("memory67", true);
        playCorrect();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === a || c.id === b ? { ...c, matched: true } : c)
          );
          setSelected([]);
          setLocked(false);
          const newPairs = pairs + 1;
          setPairs(newPairs);
          setLastMatch(true);
          onScore(20);
          if (newPairs === TOTAL_PAIRS) {
            playCelebrate();
            onCelebrate();
            onStickerEarned?.();
            setTimeout(initGame, 2500);
          }
        }, 700);
      } else {
        recordResult("memory67", false);
        playWrong();
        setLastMatch(false);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === a || c.id === b ? { ...c, flipped: false } : c)
          );
          setSelected([]);
          setLocked(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">Hitta paren!</p>
        <div className="flex gap-1 justify-center mt-2">
          {Array.from({ length: TOTAL_PAIRS }).map((_, i) => (
            <span key={i} className="text-xl">{i < pairs ? "⭐" : "○"}</span>
          ))}
        </div>
      </div>

      {pairs === TOTAL_PAIRS && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">🎉 Alla par! 🎉</div>
      )}
      {lastMatch && pairs < TOTAL_PAIRS && (
        <div className="text-xl font-black text-green-500 animate-bounce-in">⭐ Par hittat!</div>
      )}

      {/* 4x2 grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className="w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-3xl transition-all duration-300 active:scale-90 shadow-md"
            style={{
              background: card.matched
                ? "#DCFCE7"
                : card.flipped
                ? "#FEFCE8"
                : "linear-gradient(135deg,#F0ABFC,#A855F7)",
              borderColor: card.matched ? "#22C55E" : card.flipped ? "#FDE047" : "#E9D5FF",
            }}
          >
            {card.flipped || card.matched ? card.emoji : "✨"}
          </button>
        ))}
      </div>

      <button
        onClick={initGame}
        className="px-8 py-3 rounded-2xl bg-purple-500 text-white font-black text-lg shadow-lg active:scale-90 transition-transform"
      >
        Börja om
      </button>
    </div>
  );
}
