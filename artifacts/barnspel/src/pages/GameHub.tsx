import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import ParentDashboard from "@/components/ParentDashboard";
import StickerReward from "@/components/StickerReward";
import ProgressDots from "@/components/ProgressDots";
import SessionComplete from "@/pages/SessionComplete";
import { speak } from "@/lib/speech";

// Age 3-5 games
import ColorMatch from "@/games/ColorMatch";
import CountGame from "@/games/CountGame";
import PatternGame from "@/games/PatternGame";
import ShapeSort from "@/games/ShapeSort";
import MemoryGame from "@/games/MemoryGame";

// Age 6-7 games
import CountBig from "@/games/age67/CountBig";
import LetterMatch from "@/games/age67/LetterMatch";
import PatternAdv from "@/games/age67/PatternAdv";
import MemoryGame67 from "@/games/age67/MemoryGame67";

// Age 8-9 games
import MathPlus from "@/games/age89/MathPlus";
import ClockGame from "@/games/age89/ClockGame";
import EnglishWords from "@/games/age89/EnglishWords";
import LogicPuzzle from "@/games/age89/LogicPuzzle";

import { StarBurstOverlay, useStarBurst } from "@/components/StarBurst";
import { playCelebrate } from "@/lib/sounds";

export interface GameProps {
  onScore: (pts: number) => void;
  onCelebrate: () => void;
  onStickerEarned?: () => void;
}

interface GameDef {
  id: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  colorLight: string;
  component: React.ComponentType<GameProps>;
}

// Swedish question text read aloud for each game
const SPEECH_TEXT: Record<string, string> = {
  colors:     "Vilken färg stämmer?",
  count:      "Hur många ser du?",
  pattern:    "Vad kommer härnäst?",
  sort:       "Var hör det hemma?",
  memory:     "Hitta de lika paren!",
  countBig:   "Hur många ser du?",
  letters:    "Vilken bokstav hör du?",
  patternAdv: "Vad kommer härnäst?",
  memory67:   "Hitta de lika paren!",
  math:       "Räkna ut svaret!",
  clock:      "Hur mycket är klockan?",
  english:    "Vad heter det på engelska?",
  logic:      "Vilket mönster passar?",
};

const GAMES_35: GameDef[] = [
  { id: "colors",  label: "Färger",   desc: "Matcha färger",        icon: "palette",         color: "#E84393", colorLight: "#FDE8F4", component: ColorMatch  },
  { id: "count",   label: "Räkna",    desc: "Räkna till 5",         icon: "pin",             color: "#0984E3", colorLight: "#E8F3FD", component: CountGame   },
  { id: "pattern", label: "Mönster",  desc: "Hitta mönstret",       icon: "blur_on",         color: "#6C5CE7", colorLight: "#EEF0FD", component: PatternGame },
  { id: "sort",    label: "Sortera",  desc: "Sortera föremål",      icon: "category",        color: "#00B894", colorLight: "#E8F8F4", component: ShapeSort   },
  { id: "memory",  label: "Minne",    desc: "Hitta paren",          icon: "grid_view",       color: "#E17055", colorLight: "#FDF0EE", component: MemoryGame  },
];

const GAMES_67: GameDef[] = [
  { id: "countBig",   label: "Räkna 1–20", desc: "Stora tal",          icon: "format_list_numbered", color: "#0984E3", colorLight: "#E8F3FD", component: CountBig     },
  { id: "letters",    label: "Bokstäver",  desc: "Svenska alfabetet",  icon: "abc",                  color: "#6C5CE7", colorLight: "#EEF0FD", component: LetterMatch  },
  { id: "patternAdv", label: "Mönster",    desc: "Avancerade mönster", icon: "auto_awesome",         color: "#E84393", colorLight: "#FDE8F4", component: PatternAdv  },
  { id: "memory67",   label: "Minne",      desc: "Hitta paren",        icon: "grid_view",            color: "#00B894", colorLight: "#E8F8F4", component: MemoryGame67 },
];

const GAMES_89: GameDef[] = [
  { id: "math",    label: "Matte",    desc: "Addition & subtraktion", icon: "calculate",  color: "#6C5CE7", colorLight: "#EEF0FD", component: MathPlus     },
  { id: "clock",   label: "Klockan",  desc: "Läs av klockan",         icon: "schedule",   color: "#0984E3", colorLight: "#E8F3FD", component: ClockGame    },
  { id: "english", label: "Engelska", desc: "Ord & översättning",     icon: "translate",  color: "#00B894", colorLight: "#E8F8F4", component: EnglishWords },
  { id: "logic",   label: "Logik",    desc: "Lösa mönster & pussel",  icon: "extension",  color: "#E17055", colorLight: "#FDF0EE", component: LogicPuzzle  },
];

const LIMITS: Record<string, number> = { "35": 5, "67": 8, "89": 10 };

const AGE_LABELS: Record<string, { sv: string; en: string }> = {
  "35": { sv: "Småbarn · 3–5 år",       en: "Preschool · 3–5 yrs" },
  "67": { sv: "Förskoleklass · 6–7 år", en: "Pre-school yr 1 · 6–7 yrs" },
  "89": { sv: "Lågstadiet · 8–9 år",    en: "Primary school · 8–9 yrs" },
};

function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div style={{ display: "flex", alignItems: "center", background: "#F0F1F7", borderRadius: 999, padding: 3, gap: 2 }}>
      {(["sv", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? "white" : "transparent",
            border: "none", borderRadius: 999, padding: "3px 10px",
            fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 12,
            color: lang === l ? "var(--cb-primary)" : "var(--cb-text-secondary)",
            cursor: lang === l ? "default" : "pointer",
            boxShadow: lang === l ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            transition: "all 0.15s", letterSpacing: "0.03em",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function pingClass(classCode: string) {
  fetch(`/api/class/${encodeURIComponent(classCode)}/ping`, { method: "POST" }).catch(() => {});
}

export default function GameHub({ onGoBack }: { onGoBack: () => void }) {
  const { ageGroup, score, addScore, addSticker, stickers, theme, personalBest, lang } = useApp();
  const { particles, burst } = useStarBurst();

  const [activeGame, setActiveGame]     = useState<string | null>(null);
  const [showParent, setShowParent]     = useState(false);
  const [showSticker, setShowSticker]   = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [sessionDone, setSessionDone]   = useState(false);

  // Refs for stale-closure-safe access inside timeouts
  const activeGameRef  = useRef(activeGame);
  const playedGamesRef = useRef<Set<string>>(new Set());
  useEffect(() => { activeGameRef.current = activeGame; }, [activeGame]);

  const games = ageGroup === "35" ? GAMES_35 : ageGroup === "67" ? GAMES_67 : GAMES_89;
  const limit = LIMITS[ageGroup ?? "35"] ?? 5;
  const game = games.find((g) => g.id === activeGame);
  const GameComponent = game?.component;
  const ageLabel = AGE_LABELS[ageGroup ?? "35"][lang];

  // Reset progress dots + completion state when entering a new game
  useEffect(() => {
    setCorrectCount(0);
    setShowComplete(false);
  }, [activeGame]);

  const handleScore = (pts: number) => {
    addScore(pts);
    setCorrectCount((prev) => {
      const next = prev + 1;
      if (next >= limit) {
        setShowComplete(true);
        burst();
        playCelebrate();

        setTimeout(() => {
          setShowComplete(false);

          const currentId = activeGameRef.current!;
          playedGamesRef.current.add(currentId);

          // Ping anonymous class round counter if student has a class code
          try {
            const raw = localStorage.getItem("studentSession");
            if (raw) {
              const s = JSON.parse(raw) as { classCode?: string };
              if (s.classCode) pingClass(s.classCode);
            }
          } catch { /* ignore */ }

          // All games completed → session done
          if (playedGamesRef.current.size >= games.length) {
            setSessionDone(true);
            return;
          }

          // Pick random next game (never the same as current)
          const eligible = games.filter((g) => g.id !== currentId);
          const next = eligible[Math.floor(Math.random() * eligible.length)];
          setActiveGame(next?.id ?? null);
        }, 2000);
      }
      return next;
    });
  };

  const handleCelebrate = () => { burst(); };

  const handleStickerEarned = () => {
    addSticker();
    setShowSticker(true);
    setTimeout(() => setShowSticker(false), 3000);
  };

  const handlePlayAgain = () => {
    playedGamesRef.current = new Set();
    setSessionDone(false);
    setCorrectCount(0);
    setActiveGame(null);
  };

  // ── Session complete screen ────────────────────────────────────
  if (sessionDone) {
    return (
      <div className="flex flex-col flex-1" style={{ background: "var(--cb-bg)" }}>
        <header className="cb-header">
          <div className="flex items-center gap-3">
            <button className="cb-btn-icon flex items-center justify-center" onClick={onGoBack}>
              <span className="material-icons-round" style={{ fontSize: "22px" }}>arrow_back</span>
            </button>
            <div className="cb-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>psychology</span>
            </div>
          </div>
          <LangToggle />
        </header>
        <main className="cb-main flex-1 p-5">
          <div className="w-full bg-white rounded-3xl overflow-hidden" style={{ border: "4px solid #E9D5FF", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" }}>
            <SessionComplete score={score} onPlayAgain={handlePlayAgain} lang={lang} />
          </div>
        </main>
      </div>
    );
  }

  // ── Normal game / hub view ─────────────────────────────────────
  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--cb-bg)" }}>
      <StarBurstOverlay particles={particles} />
      {showParent && <ParentDashboard onClose={() => setShowParent(false)} />}
      {showSticker && <StickerReward stickers={theme.stickers} />}

      {/* Header */}
      <header className="cb-header">
        <div className="flex items-center gap-3">
          <button
            className="cb-btn-icon flex items-center justify-center"
            onClick={activeGame ? () => setActiveGame(null) : onGoBack}
          >
            <span className="material-icons-round" style={{ fontSize: "22px" }}>arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="cb-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
                <span className="material-icons-round" style={{ fontSize: 16 }}>psychology</span>
              </div>
              <span style={{ fontWeight: 800, color: "var(--cb-text)", fontSize: 15 }}>
                {activeGame ? game?.label : "Cognitive Builder"}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--cb-text-secondary)", fontWeight: 600 }}>
              {ageLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LangToggle />

          <div className="cb-score-badge">
            <span className="material-icons-round" style={{ fontSize: "18px", color: "#FDCB6E" }}>star</span>
            {score}
          </div>

          {ageGroup === "67" && (
            <div className="cb-score-badge">
              <span className="material-icons-round" style={{ fontSize: "18px", color: "#E84393" }}>local_offer</span>
              {stickers}
            </div>
          )}

          {ageGroup === "89" && personalBest !== null && (
            <div className="cb-score-badge" style={{ fontSize: "13px" }}>
              <span className="material-icons-round" style={{ fontSize: "16px", color: "#FDCB6E" }}>emoji_events</span>
              {personalBest}s
            </div>
          )}

          {!activeGame && (
            <button
              className="cb-btn-icon flex items-center justify-center"
              onClick={() => setShowParent(true)}
              title={lang === "en" ? "Dashboard" : "Framsteg"}
            >
              <span className="material-icons-round" style={{ fontSize: "22px" }}>bar_chart</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="cb-main flex-1 p-5 flex flex-col gap-4">
        {!activeGame ? (
          <>
            <div>
              <h2 className="cb-h3">{lang === "en" ? "Choose an activity" : "Välj en övning"}</h2>
              <p className="text-sm mt-1" style={{ color: "var(--cb-text-secondary)" }}>
                {lang === "en" ? "Theme:" : "Tema:"} {theme.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGame(g.id)}
                  className="cb-game-card"
                  style={{
                    gridColumn: i === games.length - 1 && games.length % 2 !== 0 ? "span 2" : undefined,
                    maxWidth: i === games.length - 1 && games.length % 2 !== 0 ? "50%" : undefined,
                    margin: i === games.length - 1 && games.length % 2 !== 0 ? "0 auto" : undefined,
                    width: "100%",
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: g.colorLight }}>
                    <span className="material-icons-round" style={{ fontSize: "28px", color: g.color }}>{g.icon}</span>
                  </div>
                  <div className="text-center">
                    <p style={{ fontWeight: 800, color: "var(--cb-text)", fontSize: 15 }}>{g.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--cb-text-secondary)" }}>{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 text-sm mt-2"
              style={{ color: "var(--cb-text-secondary)", fontWeight: 600 }}
            >
              <span className="material-icons-round" style={{ fontSize: "16px" }}>tune</span>
              {lang === "en" ? "Change age group or theme" : "Byt åldersgrupp eller tema"}
            </button>
          </>
        ) : GameComponent ? (
          <div
            className="w-full bg-white rounded-3xl overflow-hidden"
            style={{ position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.09)", border: "4px solid #E9D5FF" }}
          >
            {/* Completion overlay */}
            {showComplete && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "rgba(255,255,255,0.97)", borderRadius: "inherit",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                <div style={{ fontSize: 72, lineHeight: 1, animation: "bounce-in 0.5s ease-out" }}>⭐</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#6C5CE7", fontFamily: "Nunito, sans-serif" }}>
                  Bra jobbat!
                </div>
              </div>
            )}

            {/* Progress dots + TTS button row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" }}>
              <ProgressDots count={Math.min(correctCount, limit)} total={limit} />
              <button
                aria-label="Läs upp frågan"
                onClick={() => speak(SPEECH_TEXT[activeGame] ?? game?.label ?? "")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 22, lineHeight: 1, padding: "4px 6px",
                  borderRadius: 10, touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                🔊
              </button>
            </div>

            <GameComponent
              onScore={handleScore}
              onCelebrate={handleCelebrate}
              onStickerEarned={handleStickerEarned}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
