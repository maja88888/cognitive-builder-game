interface Props {
  score: number;
  onPlayAgain: () => void;
  lang: "sv" | "en";
}

export default function SessionComplete({ score, onPlayAgain, lang }: Props) {
  const sv = lang === "sv";
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 24, padding: "40px 24px",
        minHeight: 340, textAlign: "center",
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1, animation: "bounce-in 0.5s ease-out" }}>🎉</div>

      <div>
        <div style={{
          fontSize: 28, fontWeight: 900, color: "#6C5CE7",
          fontFamily: "Nunito, sans-serif", marginBottom: 8,
        }}>
          {sv ? "Du är klar för idag!" : "All done for today!"}
        </div>
        <div style={{
          fontSize: 16, fontWeight: 600, color: "#636E72",
          fontFamily: "Nunito, sans-serif",
        }}>
          {sv ? "Bra jobbat! Du samlade" : "Great work! You earned"}
          {" "}
          <span style={{ color: "#FDCB6E", fontWeight: 900 }}>⭐ {score}</span>
          {" "}
          {sv ? "stjärnor." : "stars."}
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        style={{
          background: "linear-gradient(135deg,#6C5CE7,#A29BFE)",
          color: "white", border: "none", borderRadius: 20,
          padding: "16px 40px", fontSize: 18, fontWeight: 800,
          fontFamily: "Nunito, sans-serif", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(108,92,231,0.4)",
          touchAction: "manipulation",
        }}
      >
        {sv ? "🔄 Spela igen!" : "🔄 Play again!"}
      </button>
    </div>
  );
}
