import { Router } from "express";
import { db, classesTable, dailyActivityTable } from "@workspace/db";
import { eq, gt, sql } from "drizzle-orm";

const router = Router();

const ANIMALS = [
  "BJÖRN", "LEJON", "TIGER", "VARG", "RÄVEN", "UGGLA",
  "LODJUR", "ÄLGEN", "ÖRNEN", "DELFIN", "PINGVIN", "PANDA",
  "KOALA", "ZEBRA", "FLODHÄST", "GEPARD",
];

function genCode(): string {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num  = Math.floor(Math.random() * 90) + 10;
  return `${word}-${num}`;
}

// Cleanup helper: delete rows older than 24 h
async function cleanupOld() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.delete(dailyActivityTable).where(
    sql`${dailyActivityTable.createdAt} < ${cutoff}`
  );
}

// POST /api/class/create
router.post("/create", async (req, res) => {
  try {
    const { name = "Klass", ageGroup = "35" } = req.body as {
      name?: string;
      ageGroup?: string;
    };

    // Generate a unique code (retry up to 5 times)
    let code = genCode();
    for (let i = 0; i < 5; i++) {
      const [existing] = await db
        .select({ id: classesTable.id })
        .from(classesTable)
        .where(eq(classesTable.code, code))
        .limit(1);
      if (!existing) break;
      code = genCode();
    }

    await db.insert(classesTable).values({ code, name: name.trim() || "Klass", ageGroup });
    res.json({ code });
  } catch (err) {
    req.log.error({ err }, "class/create failed");
    res.status(500).json({ error: "Serverfel." });
  }
});

// POST /api/class/:code/ping  — record one anonymous round
router.post("/:code/ping", async (req, res) => {
  try {
    await cleanupOld();
    const code = req.params["code"]!.toUpperCase();
    await db.insert(dailyActivityTable).values({ classCode: code });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "class/ping failed");
    res.status(500).json({ error: "Serverfel." });
  }
});

// GET /api/class/:code/stats
router.get("/:code/stats", async (req, res) => {
  try {
    await cleanupOld();
    const code = req.params["code"]!.toUpperCase();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(dailyActivityTable)
      .where(
        sql`${dailyActivityTable.classCode} = ${code} AND ${dailyActivityTable.createdAt} > ${cutoff}`
      );
    res.json({ roundsToday: row?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "class/stats failed");
    res.status(500).json({ error: "Serverfel." });
  }
});

export default router;
