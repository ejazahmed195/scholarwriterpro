import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const paraphrasingSessions = pgTable("paraphrasing_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  originalText: text("original_text").notNull(),
  paraphrasedText: text("paraphrased_text"),
  mode: text("mode").notNull(),
  language: text("language").notNull().default("English"),
  citationFormat: text("citation_format").notNull().default("APA"),
  highlights: json("highlights"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  extractedText: text("extracted_text"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertParaphrasingSessionSchema = createInsertSchema(paraphrasingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export const paraphraseRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  mode: z.enum(["academic", "formal", "creative", "seo", "simplify"]),
  language: z.string().default("English"),
  citationFormat: z.enum(["APA", "MLA", "Chicago"]).default("APA"),
  styleMatching: z.boolean().default(false),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ParaphrasingSession = typeof paraphrasingSessions.$inferSelect;
export type InsertParaphrasingSession = z.infer<typeof insertParaphrasingSessionSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type ParaphraseRequest = z.infer<typeof paraphraseRequestSchema>;
