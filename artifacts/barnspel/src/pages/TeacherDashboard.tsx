import { useState, useEffect, useCallback } from "react";
import { LGR22 } from "@/lib/lgr22";
import { useApp, type Lang } from "@/context/AppContext";

const API = "/api/teacher";
const TEACHER_CODE = "LARARE123";
const AUTH_KEY = "cb_teacher_auth";

// Game labels stay Swedish (curriculum content)
const GAME_LABELS: Record<string, string> = {
  colors:     "Färger",
  count:      "Räkna 1–5",
  pattern:    "Mönster",
  sort:       "Sortera",
  memory:     "Minne",
  countBig:   "Räkna 1–20",
  letters:    "Bokstäver",
  patternAdv: "Avancerat mönster",
  memory67:   "Minne 6–7",
  math:       "Matte",
  clock:      "Klockan",
  english:    "Engelska",
  logic:      "Logik",
};

// Age labels stay Swedish (curriculum content)
const AGE_LABELS: Record<string, string> = {
  "35": "3–5 år",
  "67": "6–7 år",
  "89": "8–9 år",
};

const T = {
  sv: {
    teacherMode:        "Lärare-läge",
    logout:             "Logga ut",
    loginTitle:         "Lärare-läge",
    loginSub:           "Ange din lärarkod för att fortsätta.",
    codePlaceholder:    "Lärarkod",
    loginBtn:           "Logga in",
    verifying:          "Verifierar...",
    wrongCode:          "Fel lärarkod. Försök igen.",
    classes:            "Klasser",
    newClass:           "Ny klass",
    cancel:             "Avbryt",
    createClass:        "Skapa ny klass",
    classNamePlaceholder:"Klassnamn (t.ex. 1B)",
    createBtn:          "Skapa klass",
    noClasses:          "Inga klasser ännu. Skapa den första!",
    loading:            "Laddar...",
    deleteClass:        "Ta bort klass",
    deleteClassConfirm: (name: string) => `Ta bort klassen "${name}"? Alla elever och framsteg raderas.`,
    code:               "Kod",
    overview:           "Översikt",
    students:           "Elever",
    addStudent:         "Lägg till elev",
    studentName:        "Elevens namn",
    noStudents:         "Inga elever ännu.",
    exportIup:          "IUP-export",
    exporting:          "Exporterar…",
    weeklySummary:      "Skicka veckosummering (e-post)",
    deleteStudentConfirm:(name: string) => `Ta bort ${name}? Alla framsteg raderas.`,
    progressTitle:      "Framstegsöversikt",
    totalAttempts:      "Totalt försök",
    accuracy:           "Samlad träffsäkerhet",
    perGame:            "Per spel",
    noProgress:         "Inga övningar registrerade ännu.",
    classOverview:      "Klassöversikt idag",
    playedToday:        "Spelade idag",
    weeklyGoal:         (days: number) => `Veckомålet (${days} dagar)`,
    inactive3:          "Inaktiva 3+ dagar",
    inactiveWarning:    "Inaktiva elever — kontakta vid behov",
    playedTodayLabel:   "Spelat idag",
    correct:            "rätt",
    addErr:             "Fel vid tillägg",
    timeNever:          "Aldrig spelat",
    timeToday:          "Idag",
    timeYesterday:      "Igår",
    timeDaysAgo:        (d: number) => `${d} dagar sedan`,
    daysPerWeek:        "d/v",
  },
  en: {
    teacherMode:        "Teacher Mode",
    logout:             "Log out",
    loginTitle:         "Teacher Mode",
    loginSub:           "Enter your teacher code to continue.",
    codePlaceholder:    "Teacher code",
    loginBtn:           "Log in",
    verifying:          "Verifying...",
    wrongCode:          "Wrong code. Please try again.",
    classes:            "Classes",
    newClass:           "New class",
    cancel:             "Cancel",
    createClass:        "Create new class",
    classNamePlaceholder:"Class name (e.g. 1B)",
    createBtn:          "Create class",
    noClasses:          "No classes yet. Create the first one!",
    loading:            "Loading...",
    deleteClass:        "Delete class",
    deleteClassConfirm: (name: string) => `Delete class "${name}"? All students and progress will be removed.`,
    code:               "Code",
    overview:           "Overview",
    students:           "Students",
    addStudent:         "Add Student",
    studentName:        "Student name",
    noStudents:         "No students yet.",
    exportIup:          "Export IUP",
    exporting:          "Exporting…",
    weeklySummary:      "Weekly Summary (email)",
    deleteStudentConfirm:(name: string) => `Remove ${name}? All progress will be deleted.`,
    progressTitle:      "Progress",
    totalAttempts:      "Total attempts",
    accuracy:           "Overall accuracy",
    perGame:            "Per game",
    noProgress:         "No activities recorded yet.",
    classOverview:      "Class overview today",
    playedToday:        "Played today",
    weeklyGoal:         (days: number) => `Weekly goal (${days} days)`,
    inactive3:          "Inactive 3+ days",
    inactiveWarning:    "Inactive students — follow up if needed",
    playedTodayLabel:   "Played today",
    correct:            "correct",
    addErr:             "Error adding student",
    timeNever:          "Never played",
    timeToday:          "Today",
    timeYesterday:      "Yesterday",
    timeDaysAgo:        (d: number) => `${d} days ago`,
    daysPerWeek:        "d/w",
  },
} satisfies Record<Lang, Record<string, unknown>>;

type Txt = typeof T.sv;

function timeAgo(iso: string | null, t: Txt): string {
  if (!iso) return t.timeNever;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t.timeToday;
  if (days === 1) return t.timeYesterday;
  return t.timeDaysAgo(days);
}

interface ClassRow    { id: number; code: string; name: string; ageGroup: string; createdAt: string; }
interface StudentRow  { id: number; name: string; classCode: string; createdAt: string; }
interface ProgressEvent { id: number; studentId: number; gameId: string; ageGroup: string; correct: boolean; recordedAt: string; }
interface StudentStat { id: number; name: string; playedToday: boolean; lastEvent: string | null; weekDays: number; inactive: boolean; }
interface ClassStats  { totalStudents: number; playedToday: number; weeklyGoalMet: number; weeklyGoalDays: number; inactive: Array<{ id: number; name: string; lastEvent: string | null }>; students: StudentStat[]; }
interface GameStats   { gameId: string; label: string; correct: number; total: number; pct: number; }

function apiHeaders() {
  return { "Content-Type": "application/json", "x-teacher-key": TEACHER_CODE };
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...apiHeaders(), ...(opts?.headers ?? {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }));
    throw new Error(err.error ?? "Network error");
  }
  return res.json() as Promise<T>;
}

function buildStats(events: ProgressEvent[]): GameStats[] {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const ev of events) {
    if (!map[ev.gameId]) map[ev.gameId] = { correct: 0, total: 0 };
    map[ev.gameId].total++;
    if (ev.correct) map[ev.gameId].correct++;
  }
  return Object.entries(map).map(([gameId, s]) => ({
    gameId, label: GAME_LABELS[gameId] ?? gameId,
    correct: s.correct, total: s.total,
    pct: Math.round((s.correct / s.total) * 100),
  }));
}

function barColor(pct: number) {
  if (pct >= 80) return "#00B894";
  if (pct >= 50) return "#FDCB6E";
  return "#E17055";
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 10, borderRadius: 999, background: "#E9ECF2", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.6s ease" }} />
    </div>
  );
}

function getWeekNumber(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// ─── Status Table ─────────────────────────────────────────────────────────────

function StatusTable({ cls, stats, t }: { cls: ClassRow; stats: ClassStats; t: Txt }) {
  const cards = [
    { icon: "today",        color: "#0984E3", bg: "#E8F3FD", value: `${stats.playedToday} / ${stats.totalStudents}`,  label: t.playedToday },
    { icon: "event_repeat", color: "#00B894", bg: "#E8F8F4", value: `${stats.weeklyGoalMet} / ${stats.totalStudents}`, label: t.weeklyGoal(stats.weeklyGoalDays) },
    {
      icon: "warning_amber",
      color: stats.inactive.length > 0 ? "#E17055" : "#00B894",
      bg:    stats.inactive.length > 0 ? "#FDF0EE" : "#E8F8F4",
      value: String(stats.inactive.length),
      label: t.inactive3,
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <p className="cb-label mb-3">{t.classOverview}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="cb-card" style={{ padding: "14px 10px", textAlign: "center", border: `1.5px solid ${c.bg}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
              <span className="material-icons-round" style={{ color: c.color, fontSize: 18 }}>{c.icon}</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 18, color: c.color, margin: 0, lineHeight: 1 }}>{c.value}</p>
            <p style={{ fontSize: 11, color: "var(--cb-text-secondary)", margin: "4px 0 0", lineHeight: 1.3 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {stats.inactive.length > 0 && (
        <div style={{ padding: "12px 14px", borderRadius: "var(--cb-radius)", background: "#FDF0EE", border: "1.5px solid #E17055", marginBottom: 12 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons-round" style={{ color: "#E17055", fontSize: 18 }}>warning_amber</span>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#E17055", margin: 0 }}>{t.inactiveWarning}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.inactive.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cb-text)" }}>{s.name}</span>
                <span style={{ fontSize: 12, color: "var(--cb-text-secondary)" }}>{timeAgo(s.lastEvent, t)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {stats.students.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, background: "white", border: "1.5px solid var(--cb-border)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: s.playedToday ? "#00B894" : s.inactive ? "#E17055" : "#FDCB6E" }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--cb-text)" }}>{s.name}</span>
            <span style={{ fontSize: 12, color: "var(--cb-text-secondary)" }}>
              {s.playedToday ? t.playedTodayLabel : timeAgo(s.lastEvent, t)}
            </span>
            <span style={{ fontSize: 11, color: "var(--cb-text-secondary)" }}>{s.weekDays}{t.daysPerWeek}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Student Progress Panel ───────────────────────────────────────────────────

function StudentProgressPanel({ student, onClose, t }: { student: StudentRow; onClose: () => void; t: Txt }) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ProgressEvent[]>(`/students/${student.id}/progress`)
      .then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, [student.id]);

  const stats = buildStats(events);
  const totalCorrect = events.filter((e) => e.correct).length;
  const totalPct = events.length > 0 ? Math.round((totalCorrect / events.length) * 100) : null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(45,52,54,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--cb-surface)", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "#EEF0FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-icons-round" style={{ color: "var(--cb-primary)", fontSize: 22 }}>person</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontWeight: 800, fontSize: 18, color: "var(--cb-text)", margin: 0 }}>{student.name}</h3>
            <p style={{ fontSize: 13, color: "var(--cb-text-secondary)", margin: 0 }}>{t.progressTitle}</p>
          </div>
          <button onClick={onClose} className="cb-btn-icon" style={{ color: "var(--cb-text-secondary)" }}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--cb-text-secondary)" }}>{t.loading}</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--cb-text-secondary)" }}>
            <span className="material-icons-round" style={{ fontSize: 40, color: "#C9CDD4" }}>quiz</span>
            <p style={{ marginTop: 8 }}>{t.noProgress}</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div className="cb-card" style={{ textAlign: "center", padding: "16px 12px" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--cb-primary)", margin: 0 }}>{events.length}</p>
                <p style={{ fontSize: 12, color: "var(--cb-text-secondary)", margin: 0 }}>{t.totalAttempts}</p>
              </div>
              <div className="cb-card" style={{ textAlign: "center", padding: "16px 12px" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: totalPct !== null ? barColor(totalPct) : "var(--cb-text-secondary)", margin: 0 }}>
                  {totalPct !== null ? `${totalPct}%` : "–"}
                </p>
                <p style={{ fontSize: 12, color: "var(--cb-text-secondary)", margin: 0 }}>{t.accuracy}</p>
              </div>
            </div>

            <p className="cb-label mb-3">{t.perGame}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stats.map((gs) => {
                const lgr = LGR22[gs.gameId];
                return (
                  <div key={gs.gameId}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--cb-text)" }}>{gs.label}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: barColor(gs.pct) }}>{gs.pct}%</span>
                    </div>
                    <ProgressBar pct={gs.pct} color={barColor(gs.pct)} />
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                      {gs.correct} {t.correct} / {gs.total}{lgr ? ` · ${lgr.subject} ${lgr.years}` : ""}
                    </p>
                    {lgr && (
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontStyle: "italic" }}>{lgr.goal}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Class Detail View ────────────────────────────────────────────────────────

function ClassDetailView({ cls, onBack, t }: { cls: ClassRow; onBack: () => void; t: Txt }) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [addErr, setAddErr] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<"overview" | "students">("overview");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<StudentRow[]>(`/classes/${cls.id}/students`),
      apiFetch<ClassStats>(`/classes/${cls.id}/stats`),
    ])
      .then(([s, st]) => { setStudents(s); setStats(st); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cls.id]);

  useEffect(() => { load(); }, [load]);

  const addStudent = async () => {
    const name = newName.trim();
    if (!name) return;
    setAddErr("");
    try {
      await apiFetch(`/classes/${cls.id}/students`, { method: "POST", body: JSON.stringify({ name }) });
      setNewName("");
      load();
    } catch (err: unknown) { setAddErr(err instanceof Error ? err.message : t.addErr); }
  };

  const removeStudent = async (s: StudentRow) => {
    if (!confirm(t.deleteStudentConfirm(s.name))) return;
    try { await apiFetch(`/students/${s.id}`, { method: "DELETE" }); load(); }
    catch (err) { console.error(err); }
  };

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}/classes/${cls.id}/export`, { headers: { "x-teacher-key": TEACHER_CODE } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `klass-${cls.code}-iup.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  const sendWeeklySummary = () => {
    if (!stats) return;
    const week = getWeekNumber();
    const inactiveList = stats.inactive.length > 0
      ? stats.inactive.map((s) => `- ${s.name} (${timeAgo(s.lastEvent, t)})`).join("\n")
      : "Alla elever är aktiva!";

    const body = [
      `Hej!`,
      ``,
      `Här är veckosummeringen för klass ${cls.name} (kod: ${cls.code}), vecka ${week}.`,
      ``,
      `📊 Sammanfattning:`,
      `• Totalt elever: ${stats.totalStudents}`,
      `• Spelade idag: ${stats.playedToday}`,
      `• Nådde veckомålet (${stats.weeklyGoalDays} dagar): ${stats.weeklyGoalMet} av ${stats.totalStudents}`,
      `• Inaktiva (3+ dagar): ${stats.inactive.length}`,
      ``,
      `⚠️ Elever att följa upp:`,
      inactiveList,
      ``,
      `Exportera detaljerad IUP-rapport direkt i Cognitive Builder.`,
      ``,
      `Genererad av Cognitive Builder | barnmatte.se`,
    ].join("\n");

    const subject = encodeURIComponent(`Veckosummering Cognitive Builder – ${cls.name} – v.${week}`);
    const bodyEnc = encodeURIComponent(body);
    window.open(`mailto:?subject=${subject}&body=${bodyEnc}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="cb-header">
        <button onClick={onBack} className="cb-btn-icon" style={{ color: "var(--cb-text-secondary)" }}>
          <span className="material-icons-round" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--cb-text)", margin: 0 }}>{cls.name}</h2>
          <p style={{ fontSize: 12, color: "var(--cb-text-secondary)", margin: 0 }}>
            {t.code}: <strong>{cls.code}</strong> · {AGE_LABELS[cls.ageGroup] ?? cls.ageGroup}
          </p>
        </div>
        <button
          onClick={downloadCsv}
          disabled={exporting}
          className="cb-btn cb-btn-secondary"
          style={{ fontSize: 13, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}
        >
          <span className="material-icons-round" style={{ fontSize: 18 }}>download</span>
          {exporting ? t.exporting : t.exportIup}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1.5px solid var(--cb-border)", background: "white" }}>
        {(["overview", "students"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            style={{
              flex: 1, padding: "12px 0", background: "none", border: "none",
              borderBottom: tab === tabKey ? "2.5px solid var(--cb-primary)" : "2.5px solid transparent",
              fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14,
              color: tab === tabKey ? "var(--cb-primary)" : "var(--cb-text-secondary)",
              cursor: "pointer", transition: "color 0.15s",
            }}
          >
            {tabKey === "overview" ? t.overview : t.students}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--cb-text-secondary)" }}>{t.loading}</div>
        ) : tab === "overview" ? (
          <>
            {stats && <StatusTable cls={cls} stats={stats} t={t} />}
            <button
              onClick={sendWeeklySummary}
              className="cb-btn cb-btn-secondary w-full"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}
            >
              <span className="material-icons-round" style={{ fontSize: 20 }}>mail_outline</span>
              {t.weeklySummary}
            </button>
          </>
        ) : (
          <>
            <p className="cb-label mb-3">{t.addStudent}</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                className="cb-input flex-1"
                placeholder={t.studentName}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStudent()}
              />
              <button
                onClick={addStudent}
                className="cb-btn cb-btn-primary"
                style={{ padding: "0 18px", display: "flex", alignItems: "center" }}
              >
                <span className="material-icons-round" style={{ fontSize: 20 }}>person_add</span>
              </button>
            </div>
            {addErr && <p style={{ color: "#E17055", fontSize: 13, marginTop: -12, marginBottom: 12 }}>{addErr}</p>}

            <p className="cb-label mb-3">{t.students} ({students.length})</p>
            {students.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--cb-text-secondary)" }}>
                <span className="material-icons-round" style={{ fontSize: 40, color: "#C9CDD4" }}>group</span>
                <p style={{ marginTop: 8 }}>{t.noStudents}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {students.map((s) => {
                  const st = stats?.students.find((x) => x.id === s.id);
                  return (
                    <div key={s.id} className="cb-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EEF0FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span className="material-icons-round" style={{ color: "var(--cb-primary)", fontSize: 20 }}>person</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: "var(--cb-text)", fontSize: 15, margin: 0 }}>{s.name}</p>
                        {st && (
                          <p style={{ fontSize: 12, color: st.playedToday ? "#00B894" : st.inactive ? "#E17055" : "var(--cb-text-secondary)", margin: 0 }}>
                            {st.playedToday ? t.playedTodayLabel : timeAgo(st.lastEvent, t)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="cb-btn cb-btn-secondary"
                        style={{ fontSize: 13, padding: "7px 12px", display: "flex", alignItems: "center", gap: 4 }}
                        title={t.progressTitle}
                      >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>bar_chart</span>
                      </button>
                      <button onClick={() => removeStudent(s)} className="cb-btn-icon" style={{ color: "#E17055" }}>
                        <span className="material-icons-round" style={{ fontSize: 20 }}>delete_outline</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {selectedStudent && (
        <StudentProgressPanel student={selectedStudent} onClose={() => setSelectedStudent(null)} t={t} />
      )}
    </div>
  );
}

// ─── Class List View ──────────────────────────────────────────────────────────

function ClassListView({ onSelectClass, t }: { onSelectClass: (cls: ClassRow) => void; t: Txt }) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("35");
  const [createErr, setCreateErr] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<ClassRow[]>("/classes").then(setClasses).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const createClass = async () => {
    if (!newName.trim()) return;
    setCreateErr("");
    try {
      await apiFetch("/classes", { method: "POST", body: JSON.stringify({ name: newName.trim(), ageGroup: newAge }) });
      setNewName(""); setShowCreate(false); load();
    } catch (err: unknown) { setCreateErr(err instanceof Error ? err.message : "Error"); }
  };

  const deleteClass = async (cls: ClassRow) => {
    if (!confirm(t.deleteClassConfirm(cls.name))) return;
    try { await apiFetch(`/classes/${cls.id}`, { method: "DELETE" }); load(); }
    catch (err) { console.error(err); }
  };

  return (
    <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="cb-label">{t.classes} ({classes.length})</p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="cb-btn cb-btn-primary"
          style={{ fontSize: 13, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
        >
          <span className="material-icons-round" style={{ fontSize: 18 }}>{showCreate ? "close" : "add"}</span>
          {showCreate ? t.cancel : t.newClass}
        </button>
      </div>

      {showCreate && (
        <div className="cb-card" style={{ marginBottom: 20, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontWeight: 700, color: "var(--cb-text)", fontSize: 15, margin: 0 }}>{t.createClass}</p>
          <input
            className="cb-input"
            placeholder={t.classNamePlaceholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createClass()}
          />
          <select className="cb-input" value={newAge} onChange={(e) => setNewAge(e.target.value)}>
            <option value="35">3–5 år (Småbarn)</option>
            <option value="67">6–7 år (Förskoleklass)</option>
            <option value="89">8–9 år (Lågstadiet)</option>
          </select>
          {createErr && <p style={{ color: "#E17055", fontSize: 13, margin: 0 }}>{createErr}</p>}
          <button onClick={createClass} className="cb-btn cb-btn-primary w-full" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>check</span>
            {t.createBtn}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--cb-text-secondary)" }}>{t.loading}</div>
      ) : classes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cb-text-secondary)" }}>
          <span className="material-icons-round" style={{ fontSize: 48, color: "#C9CDD4" }}>school</span>
          <p style={{ marginTop: 12 }}>{t.noClasses}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map((cls) => (
            <div key={cls.id} className="cb-card cb-card-interactive" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }} onClick={() => onSelectClass(cls)}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#EEF0FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-icons-round" style={{ color: "var(--cb-primary)", fontSize: 24 }}>groups</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: "var(--cb-text)", margin: 0 }}>{cls.name}</p>
                  <p style={{ fontSize: 13, color: "var(--cb-text-secondary)", margin: 0 }}>
                    {t.code}: <strong>{cls.code}</strong> · {AGE_LABELS[cls.ageGroup] ?? cls.ageGroup}
                  </p>
                </div>
                <span className="material-icons-round" style={{ color: "var(--cb-text-secondary)", fontSize: 22 }}>chevron_right</span>
              </div>
              <div style={{ borderTop: "1px solid var(--cb-border)", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => deleteClass(cls)}
                  style={{ background: "none", border: "none", color: "#E17055", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 8, fontFamily: "Nunito, sans-serif" }}
                >
                  <span className="material-icons-round" style={{ fontSize: 16 }}>delete_outline</span>
                  {t.deleteClass}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Login View ───────────────────────────────────────────────────────────────

function LoginView({ onSuccess, t }: { onSuccess: () => void; t: Txt }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!code.trim()) return;
    setLoading(true); setErr("");
    try {
      await apiFetch<{ ok: boolean }>("/auth", { method: "POST", body: JSON.stringify({ code: code.trim() }) });
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } catch { setErr(t.wrongCode); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", gap: 24 }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: "#EEF0FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="material-icons-round" style={{ color: "var(--cb-primary)", fontSize: 36 }}>manage_accounts</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: "var(--cb-text)", margin: "0 0 6px" }}>{t.loginTitle}</h2>
        <p style={{ color: "var(--cb-text-secondary)", fontSize: 15, margin: 0 }}>{t.loginSub}</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          className="cb-input"
          type="password"
          placeholder={t.codePlaceholder}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        {err && <p style={{ color: "#E17055", fontSize: 13, margin: 0, textAlign: "center" }}>{err}</p>}
        <button
          onClick={submit}
          disabled={loading || !code.trim()}
          className="cb-btn cb-btn-primary w-full"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <span className="material-icons-round" style={{ fontSize: 20 }}>{loading ? "hourglass_empty" : "login"}</span>
          {loading ? t.verifying : t.loginBtn}
        </button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function TeacherDashboard({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const t = T[lang];

  const [authed, setAuthed] = useState<boolean>(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);

  const logout = () => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); setSelectedClass(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--cb-bg)", minHeight: 0 }}>
      <div className="cb-header">
        <div className="cb-logo">
          <div className="cb-logo-icon">
            <span className="material-icons-round">psychology</span>
          </div>
          <span className="cb-logo-text">{t.teacherMode}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {authed && (
            <button onClick={logout} className="cb-btn-icon" style={{ color: "var(--cb-text-secondary)" }} title={t.logout}>
              <span className="material-icons-round" style={{ fontSize: 22 }}>logout</span>
            </button>
          )}
          <button onClick={onClose} className="cb-btn-icon" style={{ color: "var(--cb-text-secondary)" }} title="Close">
            <span className="material-icons-round" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>
      </div>

      {!authed ? (
        <LoginView onSuccess={() => setAuthed(true)} t={t} />
      ) : selectedClass ? (
        <ClassDetailView cls={selectedClass} onBack={() => setSelectedClass(null)} t={t} />
      ) : (
        <ClassListView onSelectClass={setSelectedClass} t={t} />
      )}
    </div>
  );
}
