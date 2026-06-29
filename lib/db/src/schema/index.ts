import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Classes ────────────────────────────────────────────────────────────────

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  ageGroup: text("age_group").notNull(), // "35" | "67" | "89"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type ClassRow = typeof classesTable.$inferSelect;

// ─── Students ────────────────────────────────────────────────────────────────

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  classCode: text("class_code").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type StudentRow = typeof studentsTable.$inferSelect;

// ─── Progress events ─────────────────────────────────────────────────────────

export const progressTable = pgTable("progress_events", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  gameId: text("game_id").notNull(),
  ageGroup: text("age_group").notNull(),
  correct: boolean("correct").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertProgressSchema = createInsertSchema(progressTable).omit({ id: true, recordedAt: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ProgressRow = typeof progressTable.$inferSelect;

// ─── Daily activity (anonymous round counter, no personal data) ───────────────

export const dailyActivityTable = pgTable("daily_activity", {
  id: serial("id").primaryKey(),
  classCode: text("class_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
