import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with role field
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role", { enum: ["patient", "doctor"] }).notNull().default("patient"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  count: integer("count").default(0).notNull()
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  count: true
});

// Documents schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  fileData: jsonb("file_data").notNull(), // Store the file content as JSON
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true
});

// QR Code schema
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true
});

// Medical conditions schema
export const medicalConditions = pgTable("medical_conditions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  summary: text("summary").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

export const insertMedicalConditionSchema = createInsertSchema(medicalConditions).omit({
  id: true,
  lastUpdated: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MedicalCondition = typeof medicalConditions.$inferSelect;
export type InsertMedicalCondition = z.infer<typeof insertMedicalConditionSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;

// Extend document schema for frontend use with category name
export const documentWithCategorySchema = z.object({
  id: z.number(),
  title: z.string(),
  categoryId: z.number(),
  categoryName: z.string(),
  userId: z.number(),
  fileData: z.any(),
  date: z.date(),
  notes: z.string().optional(),
  createdAt: z.date()
});

export type DocumentWithCategory = z.infer<typeof documentWithCategorySchema>;
