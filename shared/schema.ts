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

// Create a more flexible document schema for insertion
export const insertDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.number().int().positive("Category ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  fileData: z.any(), // Allow any file data structure
  date: z.string().or(z.date()), // Allow string or Date object
  notes: z.string().nullish(), // Allow both undefined and null
});

// QR Code schema
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  documentId: integer("document_id") // Optional field for document sharing
});

export const insertQrCodeSchema = createInsertSchema(qrCodes)
  .omit({
    id: true,
    createdAt: true
  })
  .extend({
    // Make documentId optional
    documentId: z.number().int().positive().optional().nullable()
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
  notes: z.string().nullish(), // Allow both undefined and null
  createdAt: z.date()
});

export type DocumentWithCategory = z.infer<typeof documentWithCategorySchema>;

// Define a schema for file data structure
export const fileDataSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  data: z.string() // Base64 encoded data
});

export type FileData = z.infer<typeof fileDataSchema>;

// Document categories and file types for frontend use
export const DOCUMENT_CATEGORIES = [
  'lab_reports',
  'prescriptions',
  'x_rays',
  'vaccinations',
  'medical_history',
  'insurance',
  'other'
];

export const FILE_TYPES = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'doc',
  'docx'
];
