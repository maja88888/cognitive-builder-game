interface Props {
  score: number;
}

const BADGES = [
  { min: 0, emoji: "🌱", label: "Nybörjare" },
  { min: 30, emoji: "⭐", label: "Stjärna" },
  { min: 80, emoji: "🌟", label: "Superstjärna" },
  { min: 150, emoji: "🏆", label: "Mästare" },
  { min: 250, emoji: "👑", label: "Kung/Drottning" },
];

export default function ScoreDisplay({ score }: Props) {
  const badge = [...BADGES].reverse().find((b) => score >= b.min) ?? BADGES[0];

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-md border-2 border-yellow-200">
      <span className="text-3xl">{badge.emoji}</span>
      <div>
        <div className="text-xs text-gray-500 font-semibold">{badge.label}</div>
        <div className="text-xl font-black text-purple-700">{score} ⭐</div>
      </div>
    </div>
  );
}
