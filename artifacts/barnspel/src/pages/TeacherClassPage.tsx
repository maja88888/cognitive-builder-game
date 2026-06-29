import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ClassInfo {
  code: string;
  url: string;
}

export default function TeacherClassPage() {
  const [className, setClassName] = useState("");
  const [ageGroup, setAgeGroup] = useState("35");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [roundsToday, setRoundsToday] = useState<number | null>(null);
  const [error, setError] = useState("");

  const createCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/class/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className || "Klass", ageGroup }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Serverfel");
      const url = `${window.location.origin}/?c=${data.code}`;
      setInfo({ code: data.code, url });
      setRoundsToday(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    if (!info) return;
    try {
      const res = await fetch(`/api/class/${info.code}/stats`);
      const data = await res.json();
      if (res.ok) setRoundsToday(data.roundsToday ?? 0);
    } catch {
      // silent
    }
  }, [info]);

  // Auto-refresh every 30 s
  useEffect(() => {
    if (!info) return;
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [info, fetchStats]);

  const reset = () => {
    setInfo(null);
    setRoundsToday(null);
    setClassName("");
  };

  return (
    <div style={{
      minHeight: "100svh", background: "#F8F9FF",
      fontFamily: "Nunito, sans-serif", display: "flex",
      flexDirection: "column", alignItems: "center",
      padding: "24px 20px 80px",
    }}>
      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", alignItems: "center", gap: 12, marginBottom: 32,
      }}>
        <div style={{
          width: 40, height: 40, background: "#6C5CE7", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="material-icons-round" style={{ color: "white", fontSize: 22 }}>psychology</span>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#2D3436" }}>Cognitive Builder</div>
          <div style={{ fontSize: 12, color: "#636E72", fontWeight: 600 }}>Lärarportal</div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {!info ? (
          /* ── Create form ── */
          <div style={{
            background: "white", borderRadius: 24, padding: 28,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1.5px solid #E8EAF0",
          }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#2D3436", marginBottom: 6 }}>
              Skapa klasskod
            </h1>
            <p style={{ fontSize: 14, color: "#636E72", marginBottom: 24, fontWeight: 600 }}>
              Generera en anonym kod som barnen skriver in i appen. Ingen persondata sparas.
            </p>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#636E72", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Klassnamn (valfritt)
              </span>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="t.ex. Björklöven"
                className="cb-input"
                style={{ marginTop: 6 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#636E72", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Åldersgrupp
              </span>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="cb-input"
                style={{ marginTop: 6 }}
              >
                <option value="35">3–5 år · Småbarn</option>
                <option value="67">6–7 år · Förskoleklass</option>
                <option value="89">8–9 år · Lågstadiet</option>
              </select>
            </label>

            {error && (
              <p style={{ color: "#E17055", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{error}</p>
            )}

            <button
              onClick={createCode}
              disabled={loading}
              style={{
                width: "100%", padding: "16px", background: "#6C5CE7",
                color: "white", border: "none", borderRadius: 16,
                fontSize: 17, fontWeight: 800, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(108,92,231,0.35)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Skapar..." : "✨ Skapa klasskod"}
            </button>
          </div>
        ) : (
          /* ── Code display ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Big code card */}
            <div style={{
              background: "white", borderRadius: 24, padding: 28,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "4px solid #E9D5FF", textAlign: "center",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#636E72", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Klasskod
              </p>
              <div style={{
                fontSize: 42, fontWeight: 900, color: "#6C5CE7",
                letterSpacing: "0.04em", fontFamily: "Nunito, sans-serif",
                marginBottom: 8,
              }}>
                {info.code}
              </div>
              <p style={{ fontSize: 13, color: "#636E72", fontWeight: 600 }}>
                Be barnen öppna appen och skriva in koden
              </p>
            </div>

            {/* QR code card */}
            <div style={{
              background: "white", borderRadius: 24, padding: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1.5px solid #E8EAF0", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#636E72" }}>
                Scanna med kameran för att öppna appen
              </p>
              <QRCodeSVG value={info.url} size={180} level="M" />
              <p style={{
                fontSize: 12, color: "#A0AEC0", wordBreak: "break-all",
                maxWidth: 300, fontWeight: 600,
              }}>
                {info.url}
              </p>
            </div>

            {/* Daily counter card */}
            <div style={{
              background: "white", borderRadius: 24, padding: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1.5px solid #E8EAF0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#636E72", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Rundor idag
                </p>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#00B894" }}>
                  {roundsToday ?? "—"}
                </div>
                <p style={{ fontSize: 11, color: "#A0AEC0", fontWeight: 600 }}>
                  Data raderas automatiskt efter 24 h
                </p>
              </div>
              <button
                onClick={fetchStats}
                style={{
                  background: "#F0F1F7", border: "none", borderRadius: 12,
                  padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#6C5CE7",
                }}
              >
                🔄 Uppdatera
              </button>
            </div>

            {/* Privacy note */}
            <div style={{
              background: "#F0F9FF", borderRadius: 16, padding: "14px 16px",
              border: "1.5px solid #BAE6FD", fontSize: 13, color: "#0369A1", fontWeight: 600,
            }}>
              🔒 Inga personuppgifter sparas. Räknaren visar bara antal avslutade spelrundor, anonymt.
            </div>

            <button
              onClick={reset}
              style={{
                background: "transparent", border: "1.5px solid #E8EAF0",
                borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700,
                color: "#636E72", cursor: "pointer",
              }}
            >
              ← Skapa ny kod
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
