interface Props {
  count: number;
  total: number;
}

export default function ProgressDots({ count, total }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 0 4px",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < count ? 16 : 13,
            height: i < count ? 16 : 13,
            borderRadius: "50%",
            background: i < count ? "#6C5CE7" : "#E9D5FF",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: i < count ? "scale(1.15)" : "scale(1)",
            boxShadow: i < count ? "0 2px 8px rgba(108,92,231,0.35)" : "none",
          }}
        />
      ))}
    </div>
  );
}
