import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [justBack, setJustBack] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setJustBack(false); };
    const goOnline  = () => {
      setOffline(false);
      setJustBack(true);
      setTimeout(() => setJustBack(false), 3000);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  if (!offline && !justBack) return null;

  const bg    = offline ? "#E17055" : "#00B894";
  const icon  = offline ? "wifi_off" : "wifi";
  const msgSv = offline
    ? "Ingen internetanslutning – sparad framsteg bevaras"
    : "Anslutningen är tillbaka!";
  const msgEn = offline
    ? "No internet – saved progress is kept"
    : "Back online!";

  const lang = (() => {
    try { return localStorage.getItem("cb_lang") ?? "sv"; } catch { return "sv"; }
  })();

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 500,
        zIndex: 9999,
        background: bg,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 16px",
        fontFamily: "Nunito, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.15)",
        transition: "background 0.3s",
      }}
    >
      <span className="material-icons-round" style={{ fontSize: 18 }}>{icon}</span>
      {lang === "en" ? msgEn : msgSv}
    </div>
  );
}
