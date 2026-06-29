import { Router } from "express";
import { db, classesTable, studentsTable, progressTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.post("/join", async (req, res) => {
  try {
    const { name, classCode, ageGroup } = req.body as {
      name: string;
      classCode: string;
      ageGroup: string;
    };

    if (!name?.trim() || !classCode?.trim()) {
      return res.status(400).json({ error: "Namn och klasskod krävs." });
    }

    const code = classCode.trim().toUpperCase();
    const trimmedName = name.trim();

    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.code, code))
      .limit(1);

    if (!cls) {
      return res.status(404).json({ error: "Klasskoden hittades inte. Kontrollera med din lärare." });
    }

    const [existing] = await db
      .select()
      .from(studentsTable)
      .where(and(eq(studentsTable.classCode, code), eq(studentsTable.name, trimmedName)))
      .limit(1);

    if (existing) {
      return res.json({ student: existing, class: cls });
    }

    const [created] = await db
      .insert(studentsTable)
      .values({ name: trimmedName, classCode: code })
      .returning();

    res.json({ student: created, class: cls });
  } catch {
    res.status(500).json({ error: "Serverfel. Försök igen." });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const { classCode, studentName, gameId, correct, timestamp } = req.body as {
      classCode: string;
      studentName: string;
      gameId: string;
      correct: boolean;
      timestamp?: string;
    };

    if (!classCode?.trim() || !studentName?.trim() || !gameId?.trim()) {
      return res.status(400).json({ error: "classCode, studentName och gameId krävs." });
    }

    const code = classCode.trim().toUpperCase();
    const trimmedName = studentName.trim();

    const [student] = await db
      .select()
      .from(studentsTable)
      .where(and(eq(studentsTable.classCode, code), eq(studentsTable.name, trimmedName)))
      .limit(1);

    if (!student) {
      return res.status(404).json({ error: "Eleven hittades inte." });
    }

    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.code, code))
      .limit(1);

    await db.insert(progressTable).values({
      studentId: student.id,
      gameId: gameId.trim(),
      ageGroup: cls?.ageGroup ?? "unknown",
      correct: Boolean(correct),
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Serverfel." });
  }
});

export default router;
