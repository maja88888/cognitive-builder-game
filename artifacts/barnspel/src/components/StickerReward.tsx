import { useEffect, useState } from "react";

interface Props {
  stickers: string[];
}

export default function StickerReward({ stickers }: Props) {
  const [visible, setVisible] = useState(true);
  const earned = stickers[Math.floor(Math.random() * stickers.length)];

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
      <div className="animate-bounce-in flex flex-col items-center gap-3">
        <div className="text-center text-white font-black text-3xl drop-shadow-xl">
          Du tjänade ett klistermärke!
        </div>
        <div
          className="w-40 h-40 rounded-3xl bg-white shadow-2xl flex items-center justify-center border-8 border-yellow-300 animate-glow-pulse"
        >
          <span className="text-8xl">{earned}</span>
        </div>
        <div className="text-white/90 text-lg font-bold">Bra jobbat! ⭐</div>
      </div>
    </div>
  );
}
