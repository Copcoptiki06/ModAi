import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  email: text("email"),
  teacherUsername: text("teacher_username"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  teacherUsername: text("teacher_username").notNull(),
  grade: integer("grade").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const enrollments = sqliteTable("enrollments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id").notNull(),
  studentUsername: text("student_username").notNull(),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  grade: integer("grade").notNull(), unit: text("unit").notNull(), topic: text("topic").notNull(),
  type: text("type", { enum: ["multiple_choice", "true_false", "open_ended"] }).notNull(),
  prompt: text("prompt").notNull(), optionsJson: text("options_json").notNull().default("[]"),
  correctAnswer: text("correct_answer").notNull(), hint: text("hint").notNull(), imageUrl: text("image_url"),
  status: text("status", { enum: ["published", "draft"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }), classId: integer("class_id"),
  teacherUsername: text("teacher_username").notNull(), title: text("title").notNull(), message: text("message").notNull(),
  unit: text("unit"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }), studentUsername: text("student_username").notNull(),
  questionId: integer("question_id").notNull(), answer: text("answer").notNull(), isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0), hintsUsed: integer("hints_used").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const aiInteractions = sqliteTable("ai_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }), studentUsername: text("student_username").notNull(),
  questionId: integer("question_id"), kind: text("kind").notNull(), content: text("content").notNull(),
  helped: integer("helped", { mode: "boolean" }).notNull().default(false), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
