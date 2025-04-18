import { pgTable, text, serial, integer, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define document categories enum
export const DOCUMENT_CATEGORIES = [
  "lab_results",
  "prescriptions",
  "imaging",
  "surgical",
  "vaccination",
  "other"
] as const;

// Define file types
export const FILE_TYPES = ["pdf", "jpg", "jpeg", "png"] as const;

// Define the documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().$type<typeof DOCUMENT_CATEGORIES[number]>(),
  date: text("date").notNull(), // ISO date string
  fileType: text("fileType").notNull().$type<typeof FILE_TYPES[number]>(),
  fileData: text("fileData").notNull(), // Base64 encoded file content
  createdAt: text("createdAt").notNull(), // ISO date string
});

// Create insert schema for validation
export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true })
  .extend({
    category: z.enum(DOCUMENT_CATEGORIES),
    fileType: z.enum(FILE_TYPES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  });

// Filter options schema
export const filterSchema = z.object({
  category: z.enum([...DOCUMENT_CATEGORIES, ""]).optional(),
  date: z.enum(["", "last_month", "last_3_months", "last_6_months", "last_year", "custom"]).optional(),
  search: z.string().optional(),
});

// Export types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentFilter = z.infer<typeof filterSchema>;

// The users table is kept for authentication purposes
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
