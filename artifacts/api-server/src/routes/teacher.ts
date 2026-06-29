import { Router } from "express";
import { db, classesTable, studentsTable, progressTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const TEACHER_CODE = "LARARE123";

const LGR22_GOALS: Record<string, string> = {
  colors:     "Lgr22 Ma 1-3: Geometri – beskriva och jämföra grundläggande egenskaper hos geometriska objekt",
  count:      "Lgr22 Ma 1-3: Taluppfattning – naturliga tal och deras egenskaper, hur de kan delas upp samt hur de kan användas för att ange antal",
  pattern:    "Lgr22 Ma 1-3: Algebra – enkla mönster i talföljder och enkla geometriska mönster",
  sort:       "Lgr22 Ma 1-3: Geometri – konstruera och beskriva geometriska objekt",
  memory:     "Lgr22 Ma 1-3: Problemlösning – strategier för att lösa matematiska problem i elevnära situationer",
  countBig:   "Lgr22 Ma 1-3: Taluppfattning – naturliga tal och hur de kan uttryckas i olika former samt deras storleksordning",
  letters:    "Lgr22 Sv 1-3: Läsa och skriva – sambandet mellan ljud och bokstav, bokstavsformer och vokaler/konsonanter",
  patternAdv: "Lgr22 Ma 1-3: Algebra – enkla algebraiska uttryck, ekvationer och geometriska mönster",
  memory67:   "Lgr22 Ma 1-3: Problemlösning – använda matematiska metoder för att lösa rutinuppgifter",
  math:       "Lgr22 Ma 1-3: Aritmetik – addition och subtraktion med naturliga tal samt metoder för beräkningar med skriftliga metoder",
  clock:      "Lgr22 Ma 1-3: Mätning – klockan och hur den kan läsas av",
  english:    "Lgr22 Eng 1-3: Kommunikationens innehåll – ämnesområden med koppling till vardag och intressen, ord och fraser",
  logic:      "Lgr22 Ma 1-3: Problemlösning – strategier och metoder för matematisk problemlösning och resonemang",
};

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

const router = Router();

function requireTeacher(req: any, res: any, next: any) {
  const key = req.headers["x-teacher-key"] as string | undefined;
  if (key !== TEACHER_CODE) {
    return res.status(401).json({ error: "Ogiltig lärarkod." });
  }
  next();
}

router.post("/auth", (req, res) => {
  const { code } = req.body as { code?: string };
  if (code === TEACHER_CODE) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Ogiltig lärarkod." });
  }
});

router.get("/classes", requireTeacher, async (_req, res) => {
  try {
    const classes = await db
      .select()
      .from(classesTable)
      .orderBy(desc(classesTable.createdAt));
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Databasfel." });
  }
});

router.post("/classes", requireTeacher, async (req, res) => {
  try {
    const { name, ageGroup } = req.body as { name: string; ageGroup: string };
    if (!name || !ageGroup) return res.status(400).json({ error: "Namn och åldersgrupp krävs." });
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [created] = await db
      .insert(classesTable)
      .values({ name, ageGroup, code })
      .returning();
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte skapa klassen." });
  }
});

router.delete("/classes/:id", requireTeacher, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (cls) {
      const students = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.classCode, cls.code));
      for (const s of students) {
        await db.delete(progressTable).where(eq(progressTable.studentId, s.id));
      }
      await db.delete(studentsTable).where(eq(studentsTable.classCode, cls.code));
    }
    await db.delete(classesTable).where(eq(classesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Kunde inte ta bort klassen." });
  }
});

router.get("/classes/:id/students", requireTeacher, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (!cls) return res.status(404).json({ error: "Klassen hittades inte." });
    const students = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.classCode, cls.code))
      .orderBy(studentsTable.name);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Databasfel." });
  }
});

router.post("/classes/:id/students", requireTeacher, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body as { name: string };
    if (!name) return res.status(400).json({ error: "Namn krävs." });
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (!cls) return res.status(404).json({ error: "Klassen hittades inte." });
    const [created] = await db
      .insert(studentsTable)
      .values({ name, classCode: cls.code })
      .returning();
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte lägga till eleven." });
  }
});

router.delete("/students/:studentId", requireTeacher, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    await db.delete(progressTable).where(eq(progressTable.studentId, studentId));
    await db.delete(studentsTable).where(eq(studentsTable.id, studentId));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Kunde inte ta bort eleven." });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const { studentId, gameId, ageGroup, correct } = req.body as {
      studentId: number;
      gameId: string;
      ageGroup: string;
      correct: boolean;
    };
    const [created] = await db
      .insert(progressTable)
      .values({ studentId, gameId, ageGroup, correct })
      .returning();
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte spara framsteg." });
  }
});

router.get("/students/:studentId/progress", requireTeacher, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const events = await db
      .select()
      .from(progressTable)
      .where(eq(progressTable.studentId, studentId))
      .orderBy(desc(progressTable.recordedAt));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Databasfel." });
  }
});

router.get("/classes/:id/export", requireTeacher, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (!cls) return res.status(404).json({ error: "Klassen hittades inte." });

    const students = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.classCode, cls.code))
      .orderBy(studentsTable.name);

    const rows: string[] = [];
    rows.push(`"Klass: ${cls.name} (${cls.code})"`);
    rows.push("");
    rows.push("Elev,Spel,Rätt svar,Totalt försök,Träffsäkerhet %,Lgr22-mål");

    for (const student of students) {
      const events = await db
        .select()
        .from(progressTable)
        .where(eq(progressTable.studentId, student.id));

      const byGame: Record<string, { correct: number; total: number }> = {};
      for (const ev of events) {
        if (!byGame[ev.gameId]) byGame[ev.gameId] = { correct: 0, total: 0 };
        byGame[ev.gameId].total++;
        if (ev.correct) byGame[ev.gameId].correct++;
      }

      if (Object.keys(byGame).length === 0) {
        rows.push(`"${student.name}",Inga övningar,-,-,-,-`);
      } else {
        for (const [gameId, stats] of Object.entries(byGame)) {
          const pct = Math.round((stats.correct / stats.total) * 100);
          const label = GAME_LABELS[gameId] ?? gameId;
          const goal = LGR22_GOALS[gameId] ?? "";
          rows.push(`"${student.name}","${label}",${stats.correct},${stats.total},${pct}%,"${goal}"`);
        }
      }
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="klass-${cls.code}-iup.csv"`,
    );
    res.send("\uFEFF" + rows.join("\r\n"));
  } catch (err) {
    res.status(500).json({ error: "Kunde inte exportera." });
  }
});

router.get("/classes/:id/stats", requireTeacher, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (!cls) return res.status(404).json({ error: "Klassen hittades inte." });

    const students = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.classCode, cls.code))
      .orderBy(studentsTable.name);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const studentStats: Array<{
      id: number;
      name: string;
      playedToday: boolean;
      lastEvent: Date | null;
      weekDays: number;
      inactive: boolean;
    }> = [];

    for (const student of students) {
      const events = await db
        .select()
        .from(progressTable)
        .where(eq(progressTable.studentId, student.id))
        .orderBy(desc(progressTable.recordedAt));

      const lastEvent = events[0]?.recordedAt ?? null;
      const playedToday = events.some((e) => new Date(e.recordedAt) >= todayStart);

      const weekDaySet = new Set(
        events
          .filter((e) => new Date(e.recordedAt) >= weekStart)
          .map((e) => new Date(e.recordedAt).toDateString()),
      );

      studentStats.push({
        id: student.id,
        name: student.name,
        playedToday,
        lastEvent,
        weekDays: weekDaySet.size,
        inactive: !lastEvent || new Date(lastEvent) < threeDaysAgo,
      });
    }

    const WEEKLY_GOAL_DAYS = 3;

    res.json({
      totalStudents: students.length,
      playedToday: studentStats.filter((s) => s.playedToday).length,
      weeklyGoalMet: studentStats.filter((s) => s.weekDays >= WEEKLY_GOAL_DAYS).length,
      weeklyGoalDays: WEEKLY_GOAL_DAYS,
      inactive: studentStats
        .filter((s) => s.inactive)
        .map((s) => ({ id: s.id, name: s.name, lastEvent: s.lastEvent })),
      students: studentStats,
    });
  } catch (err) {
    res.status(500).json({ error: "Databasfel." });
  }
});

export default router;
