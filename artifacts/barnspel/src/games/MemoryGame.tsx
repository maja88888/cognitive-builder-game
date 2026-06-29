import { useState, useEffect, useCallback } from "react";
import { recordResult } from "@/lib/progress";

const CARD_EMOJIS = ["🐱", "🐶", "🌸", "⭐", "🍎", "🦋"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

interface Props {
  onScore: (points: number) => void;
  onCelebrate: () => void;
}

const TOTAL_PAIRS = 3; // 3 pairs = 6 cards — simpler for 3-year-olds

export default function MemoryGame({ onScore, onCelebrate }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [pairs, setPairs] = useState(0);
  const [lastMatch, setLastMatch] = useState(false);

  const initGame = useCallback(() => {
    const emojis = CARD_EMOJIS.slice(0, TOTAL_PAIRS);
    const doubled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(doubled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    setSelected([]);
    setLocked(false);
    setPairs(0);
    setLastMatch(false);
  }, []);

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
        recordResult("memory", true);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === a || c.id === b ? { ...c, matched: true } : c)
          );
          setSelected([]);
          setLocked(false);
          const newPairs = pairs + 1;
          setPairs(newPairs);
          setLastMatch(true);
          onScore(15);
          if (newPairs === TOTAL_PAIRS) {
            onCelebrate();
            setTimeout(() => initGame(), 2500);
          }
        }, 700);
      } else {
        recordResult("memory", false);
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

  const allMatched = pairs === TOTAL_PAIRS;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-2xl font-black text-gray-700">Hitta paren!</p>
        <div className="flex gap-2 justify-center mt-2">
          {Array.from({ length: TOTAL_PAIRS }).map((_, i) => (
            <span key={i} className="text-2xl">{i < pairs ? "⭐" : "○"}</span>
          ))}
        </div>
      </div>

      {allMatched && (
        <div className="text-3xl font-black text-green-500 animate-bounce-in text-center">
          🎉 Alla par hittade! 🎉
        </div>
      )}
      {lastMatch && !allMatched && (
        <div className="text-2xl font-black text-green-500 animate-bounce-in">⭐ Rätt par!</div>
      )}

      {/* Card grid — 3 pairs = 6 cards in 3x2 */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className="w-20 h-20 rounded-2xl shadow-md border-4 flex items-center justify-center text-4xl transition-all duration-300 active:scale-90"
            style={{
              backgroundColor: card.matched
                ? "#DCFCE7"
                : card.flipped
                ? "#FEFCE8"
                : undefined,
              background: card.matched
                ? "#DCFCE7"
                : card.flipped
                ? "#FEFCE8"
                : "linear-gradient(135deg,#F0ABFC,#A855F7)",
              borderColor: card.matched
                ? "#22C55E"
                : card.flipped
                ? "#FDE047"
                : "#E9D5FF",
              transform: card.matched ? "scale(0.95)" : undefined,
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
