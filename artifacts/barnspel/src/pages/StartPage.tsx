import { useState } from "react";
import { THEMES } from "@/lib/themes";
import { useApp, type AgeGroup } from "@/context/AppContext";

const UI = {
  sv: {
    welcomeTo:      "Välkommen till",
    tagline:        "Lär dig leka,\nlek dig lära.",
    taglineSub:     "Välj din åldersgrupp och ett tema för att komma igång.",
    ageGroupLabel:  "Åldersgrupp",
    themeLabel:     "Välj tema",
    startBtn:       "Börja lära",
    startBtnHint:   "Välj åldersgrupp för att fortsätta",
    classCodeLink:  "Har du en klasskod? (valfritt)",
    namePlaceholder:"Ditt namn",
    codePlaceholder:"Klasskod (t.ex. Z8LIE1)",
    lgr22Badge:     "Alla övningar följer",
    lgr22BadgeEnd:  "och är utformade i samarbete med lärare.",
    teacher:        "Lärare",
    connecting:     "Ansluter...",
    networkErr:     "Kunde inte ansluta. Kontrollera nätverket.",
  },
  en: {
    welcomeTo:      "Welcome to",
    tagline:        "Learn by playing,\nplay by learning.",
    taglineSub:     "Choose your age group and a theme to get started.",
    ageGroupLabel:  "Age group",
    themeLabel:     "Choose theme",
    startBtn:       "Start game",
    startBtnHint:   "Choose an age group to continue",
    classCodeLink:  "Have a class code? (optional)",
    namePlaceholder:"Your name",
    codePlaceholder:"Class code (e.g. Z8LIE1)",
    lgr22Badge:     "All activities follow",
    lgr22BadgeEnd:  "and are designed with teachers.",
    teacher:        "Teacher",
    connecting:     "Connecting...",
    networkErr:     "Could not connect. Check your network.",
  },
};

const AGE_GROUPS = [
  {
    id: "35" as AgeGroup,
    sv: { label: "3–5 år", sublabel: "Småbarn",      desc: "Färger, former och räkna till 5" },
    en: { label: "3–5 yrs", sublabel: "Preschool",   desc: "Colors, shapes and count to 5" },
    icon: "child_care", color: "#00B894", colorLight: "#E8F8F4",
  },
  {
    id: "67" as AgeGroup,
    sv: { label: "6–7 år", sublabel: "Förskoleklass", desc: "Bokstäver, räkna till 20 och mönster" },
    en: { label: "6–7 yrs", sublabel: "Pre-school yr 1", desc: "Letters, count to 20 and patterns" },
    icon: "school", color: "#6C5CE7", colorLight: "#EEF0FD",
  },
  {
    id: "89" as AgeGroup,
    sv: { label: "8–9 år", sublabel: "Lågstadiet",   desc: "Matte, klockan, engelska och logik" },
    en: { label: "8–9 yrs", sublabel: "Primary school", desc: "Math, clock, English and logic" },
    icon: "menu_book", color: "#0984E3", colorLight: "#E8F3FD",
  },
];

const THEME_ICONS: Record<string, { icon: string; color: string }> = {
  dinosaurs: { icon: "forest",         color: "#27AE60" },
  space:     { icon: "public",          color: "#6C5CE7" },
  princess:  { icon: "castle",          color: "#E84393" },
  vehicles:  { icon: "directions_car",  color: "#0984E3" },
  animals:   { icon: "pets",            color: "#E17055" },
  heroes:    { icon: "bolt",            color: "#E84393" },
};

function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#F0F1F7",
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {(["sv", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? "white" : "transparent",
            border: "none",
            borderRadius: 999,
            padding: "3px 10px",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            color: lang === l ? "var(--cb-primary)" : "var(--cb-text-secondary)",
            cursor: lang === l ? "default" : "pointer",
            boxShadow: lang === l ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            transition: "all 0.15s",
            letterSpacing: "0.03em",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

interface Props {
  onTeacherClick: () => void;
}

export default function StartPage({ onTeacherClick }: Props) {
  const { setAgeGroup, themeId, setThemeId, studentSession, setStudentSession, lang } = useApp();
  const t = UI[lang];

  const [pickedAge, setPickedAge] = useState<AgeGroup | null>(null);
  const [pickedTheme, setPickedTheme] = useState(themeId);

  const [showClassInput, setShowClassInput] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const canStart = pickedAge !== null;

  const handleStart = async () => {
    if (!pickedAge) return;

    if (showClassInput && studentName.trim() && classCode.trim()) {
      setJoining(true);
      setJoinError("");
      try {
        const res = await fetch("/api/student/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: studentName.trim(),
            classCode: classCode.trim().toUpperCase(),
            ageGroup: pickedAge,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setJoinError(data.error ?? (lang === "en" ? "Something went wrong." : "Något gick fel."));
          setJoining(false);
          return;
        }
        setStudentSession({
          id: data.student.id,
          studentName: data.student.name,
          classCode: data.student.classCode,
          ageGroup: pickedAge,
        });
      } catch {
        setJoinError(t.networkErr);
        setJoining(false);
        return;
      }
      setJoining(false);
    }

    setAgeGroup(pickedAge);
    setThemeId(pickedTheme);
  };

  const clearSession = () => {
    setStudentSession(null);
    setStudentName("");
    setClassCode("");
    setShowClassInput(false);
  };

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--cb-bg)" }}>
      <header className="cb-header">
        <div className="cb-logo">
          <div className="cb-logo-icon">
            <span className="material-icons-round">psychology</span>
          </div>
          <span className="cb-logo-text">Cognitive Builder</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LangToggle />
          <button
            className="cb-btn-icon flex items-center justify-center"
            style={{ color: "var(--cb-text-secondary)" }}
            title={t.teacher}
            onClick={onTeacherClick}
          >
            <span className="material-icons-round" style={{ fontSize: "22px" }}>manage_accounts</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-5 flex-1">

        {/* EN curriculum badge */}
        {lang === "en" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 12,
              background: "#EEF0FD",
              border: "1.5px solid var(--cb-primary)",
            }}
          >
            <span className="material-icons-round" style={{ color: "var(--cb-primary)", fontSize: 16, flexShrink: 0 }}>
              info
            </span>
            <p style={{ fontSize: 12, color: "var(--cb-primary)", fontWeight: 700, margin: 0 }}>
              Swedish curriculum (Lgr22) – UI in English
            </p>
          </div>
        )}

        <div>
          <p className="cb-label mb-1">{t.welcomeTo}</p>
          <h1 className="cb-h1" style={{ whiteSpace: "pre-line" }}>{t.tagline}</h1>
          <p className="cb-body mt-2" style={{ color: "var(--cb-text-secondary)" }}>
            {t.taglineSub}
          </p>
        </div>

        <div>
          <p className="cb-label mb-3">{t.ageGroupLabel}</p>
          <div className="flex flex-col gap-3">
            {AGE_GROUPS.map((ag) => {
              const active = pickedAge === ag.id;
              const copy = lang === "en" ? ag.en : ag.sv;
              return (
                <button
                  key={ag.id}
                  onClick={() => setPickedAge(ag.id)}
                  className="cb-card cb-card-interactive text-left flex items-center gap-4"
                  style={{
                    borderColor: active ? ag.color : "var(--cb-border)",
                    boxShadow: active ? `0 4px 20px ${ag.color}30` : undefined,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: active ? ag.color : ag.colorLight }}
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: "24px", color: active ? "white" : ag.color }}
                    >
                      {ag.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg" style={{ color: "var(--cb-text)" }}>{copy.label}</span>
                      <span className="text-sm" style={{ color: "var(--cb-text-secondary)" }}>{copy.sublabel}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "var(--cb-text-secondary)" }}>{copy.desc}</p>
                  </div>
                  {active && (
                    <span className="material-icons-round flex-shrink-0" style={{ color: ag.color, fontSize: "22px" }}>
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="cb-label mb-3">{t.themeLabel}</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((th) => {
              const active = pickedTheme === th.id;
              const iconDef = THEME_ICONS[th.id] ?? { icon: "star", color: "#6C5CE7" };
              return (
                <button
                  key={th.id}
                  onClick={() => setPickedTheme(th.id)}
                  className="cb-card cb-card-interactive flex flex-col items-center gap-2"
                  style={{
                    borderColor: active ? iconDef.color : "var(--cb-border)",
                    boxShadow: active ? `0 4px 16px ${iconDef.color}30` : undefined,
                    padding: "16px 8px",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: active ? iconDef.color : `${iconDef.color}18` }}
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: "20px", color: active ? "white" : iconDef.color }}
                    >
                      {iconDef.icon}
                    </span>
                  </div>
                  <span
                    className="text-xs text-center leading-tight"
                    style={{ fontWeight: 700, color: active ? "var(--cb-text)" : "var(--cb-text-secondary)" }}
                  >
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Class code — optional, completely silent */}
        {studentSession ? (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderRadius: "var(--cb-radius)", background: "#E8F8F4",
              border: "1.5px solid #00B894",
            }}
          >
            <span className="material-icons-round flex-shrink-0" style={{ color: "#00B894", fontSize: 20 }}>
              group
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--cb-text)", margin: 0 }}>
                {studentSession.studentName}
              </p>
              <p style={{ fontSize: 12, color: "#00B894", margin: 0, fontWeight: 600 }}>
                {lang === "en" ? "Class" : "Klass"} {studentSession.classCode}
              </p>
            </div>
            <button
              onClick={clearSession}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#636E72", padding: 4 }}
              title={lang === "en" ? "Change student" : "Byt elev"}
            >
              <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowClassInput((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, padding: 0,
                color: "var(--cb-text-secondary)", fontSize: 13, fontWeight: 600,
                fontFamily: "Nunito, sans-serif",
              }}
            >
              <span className="material-icons-round" style={{ fontSize: 18 }}>
                {showClassInput ? "expand_less" : "expand_more"}
              </span>
              {t.classCodeLink}
            </button>

            {showClassInput && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  className="cb-input"
                  placeholder={t.namePlaceholder}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  autoComplete="given-name"
                />
                <input
                  className="cb-input"
                  placeholder={t.codePlaceholder}
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  autoCapitalize="characters"
                />
                {joinError && (
                  <p style={{ color: "#E17055", fontSize: 13, margin: 0 }}>{joinError}</p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!canStart || joining}
          className="cb-btn cb-btn-primary w-full"
          style={{ fontSize: "20px", paddingTop: "20px", paddingBottom: "20px" }}
        >
          <span className="material-icons-round" style={{ fontSize: "22px" }}>
            {joining ? "hourglass_empty" : "play_arrow"}
          </span>
          {joining
            ? t.connecting
            : canStart
              ? t.startBtn
              : t.startBtnHint}
        </button>

        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "#EEF0FD" }}>
          <span className="material-icons-round flex-shrink-0 mt-0.5" style={{ color: "var(--cb-primary)", fontSize: "20px" }}>
            verified
          </span>
          <p className="text-sm leading-snug" style={{ color: "var(--cb-text-secondary)" }}>
            {t.lgr22Badge} <strong style={{ color: "var(--cb-text)" }}>Lgr22</strong> {t.lgr22BadgeEnd}
          </p>
        </div>
      </div>
    </div>
  );
}
