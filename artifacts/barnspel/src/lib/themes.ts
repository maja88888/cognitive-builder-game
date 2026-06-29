export interface Theme {
  id: string;
  name: string;
  icon: string;
  bgClass: string;
  cardBg: string;
  btnBg: string;
  actors: string[];
  stickers: string[];
  starterEmoji: string;
}

export const THEMES: Theme[] = [
  {
    id: "dinosaurs",
    name: "Dinosaurier",
    icon: "🦕",
    bgClass: "bg-gradient-to-b from-green-800 via-emerald-600 to-lime-300",
    cardBg: "from-emerald-400 to-green-700",
    btnBg: "from-emerald-500 to-green-700",
    actors: ["🦕", "🦖", "🥚", "🦴", "🌿", "🌋", "💎", "🪨"],
    stickers: ["🦕", "🦖", "🥚", "🌋", "💎", "🦴", "🌿", "⚡"],
    starterEmoji: "🦕",
  },
  {
    id: "space",
    name: "Rymden",
    icon: "🚀",
    bgClass: "bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-700",
    cardBg: "from-indigo-500 to-purple-700",
    btnBg: "from-indigo-500 to-purple-700",
    actors: ["🚀", "⭐", "🌍", "🌙", "👾", "🛸", "☄️", "🔭"],
    stickers: ["🚀", "⭐", "🌟", "🌙", "🛸", "👾", "☄️", "🌍"],
    starterEmoji: "🚀",
  },
  {
    id: "princess",
    name: "Prinsessor",
    icon: "👸",
    bgClass: "bg-gradient-to-b from-pink-500 via-rose-300 to-pink-100",
    cardBg: "from-pink-400 to-rose-500",
    btnBg: "from-pink-400 to-rose-500",
    actors: ["👸", "🏰", "🌸", "💎", "🦄", "🌟", "🎀", "🪄"],
    stickers: ["👸", "🏰", "💎", "🦄", "🌸", "✨", "👑", "🎀"],
    starterEmoji: "👸",
  },
  {
    id: "vehicles",
    name: "Fordon",
    icon: "🚗",
    bgClass: "bg-gradient-to-b from-sky-700 via-blue-500 to-cyan-300",
    cardBg: "from-blue-500 to-sky-600",
    btnBg: "from-blue-500 to-sky-600",
    actors: ["🚗", "🚂", "✈️", "🚢", "🚀", "🏎️", "🚁", "🛵"],
    stickers: ["🚗", "🚂", "✈️", "🚢", "🏎️", "🚁", "🛵", "🚒"],
    starterEmoji: "🚗",
  },
  {
    id: "animals",
    name: "Djur",
    icon: "🐱",
    bgClass: "bg-gradient-to-b from-amber-500 via-orange-300 to-yellow-100",
    cardBg: "from-amber-400 to-orange-500",
    btnBg: "from-amber-400 to-orange-500",
    actors: ["🐱", "🐶", "🦁", "🐸", "🦋", "🐼", "🦊", "🐬"],
    stickers: ["🐱", "🐶", "🦁", "🐸", "🦋", "🐼", "🦊", "🐬"],
    starterEmoji: "🐱",
  },
  {
    id: "heroes",
    name: "Superhjältar",
    icon: "🦸",
    bgClass: "bg-gradient-to-b from-red-600 via-orange-400 to-yellow-300",
    cardBg: "from-red-500 to-orange-600",
    btnBg: "from-red-500 to-orange-600",
    actors: ["🦸", "⚡", "🛡️", "💥", "🌟", "🔥", "💪", "🎯"],
    stickers: ["🦸", "⚡", "🛡️", "💥", "🌟", "🔥", "💪", "🎯"],
    starterEmoji: "🦸",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
