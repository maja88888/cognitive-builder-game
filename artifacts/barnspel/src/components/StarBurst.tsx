import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const CELEBRATE_EMOJIS = ["⭐", "🌟", "✨", "🎉", "🎊", "💫", "🌈", "🎈"];

export function useStarBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = () => {
    const count = 8;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      emoji: CELEBRATE_EMOJIS[Math.floor(Math.random() * CELEBRATE_EMOJIS.length)],
    }));
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles((p) => p.filter((particle) => !newParticles.find((np) => np.id === particle.id)));
    }, 1000);
  };

  return { particles, burst };
}

export function StarBurstOverlay({ particles }: { particles: Particle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="star-particle absolute text-4xl"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: "0.8s",
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
