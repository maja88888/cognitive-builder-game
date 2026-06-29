export type GameId =
  // Age 3-5
  | "colors" | "count" | "pattern" | "sort" | "memory"
  // Age 6-7
  | "countBig" | "letters" | "patternAdv" | "memory67" | "sort67"
  // Age 8-9
  | "math" | "clock" | "english" | "logic";

export interface GameStats {
  correct: number;
  wrong: number;
  lastPlayed: number;
}

export type ProgressData = Record<GameId, GameStats>;

const STORAGE_KEY = "lekis_progress_v2";
const STUDENT_KEY = "studentSession";

const ALL_IDS: GameId[] = [
  "colors", "count", "pattern", "sort", "memory",
  "countBig", "letters", "patternAdv", "memory67", "sort67",
  "math", "clock", "english", "logic",
];

function defaultStats(): GameStats {
  return { correct: 0, wrong: 0, lastPlayed: 0 };
}

function buildDefault(): ProgressData {
  return Object.fromEntries(ALL_IDS.map((id) => [id, defaultStats()])) as ProgressData;
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefault();
    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    const base = buildDefault();
    for (const id of ALL_IDS) {
      if (parsed[id]) base[id] = parsed[id]!;
    }
    return base;
  } catch {
    return buildDefault();
  }
}

export function saveProgress(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function recordResult(gameId: GameId, correct: boolean): void {
  const data = loadProgress();
  if (correct) data[gameId].correct += 1;
  else data[gameId].wrong += 1;
  data[gameId].lastPlayed = Date.now();
  saveProgress(data);

  const studentData = localStorage.getItem(STUDENT_KEY);
  if (studentData) {
    try {
      const { classCode, studentName } = JSON.parse(studentData);
      const age = localStorage.getItem("ageGroup") || "8-9";
      const curriculumMap: Record<string, { badge: string; lgr22: string }> = {
        "3-5": { badge: "Färger, former, räkna 1-5", lgr22: "FK – Taluppfattning" },
        "6-7": { badge: "Bokstäver, tal 0-20, mönster", lgr22: "FK/Åk1 – Tal & mönster" },
        "8-9": { badge: "Matte, klockan, engelska", lgr22: "Åk1-3 – Tal, tid, ord" },
      };
      fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode,
          studentName,
          gameId,
          correct,
          timestamp: new Date().toISOString(),
          curriculum: curriculumMap[age],
        }),
      }).catch(() => {});
    } catch { /* silent */ }
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function accuracy(stats: GameStats): number {
  const total = stats.correct + stats.wrong;
  if (total === 0) return -1;
  return Math.round((stats.correct / total) * 100);
}
