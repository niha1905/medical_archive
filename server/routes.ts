import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertCategorySchema,
  insertDocumentSchema,
  insertQrCodeSchema,
} from "@shared/schema";
import { randomBytes } from "crypto";
import { ZodError } from "zod";
import { setupAuth } from "./auth";
import { Buffer } from "buffer";

interface FileData {
  data: string;
  name: string;
  type: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Helper function to handle validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    console.error("Unexpected error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  };

  // Define routes (users, categories, documents, etc.)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Categories routes
  app.get("/api/users/:userId/categories", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Documents routes
  app.get("/api/users/:userId/documents", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let documents;
      if (categoryId && !isNaN(categoryId)) {
        documents = await storage.getDocumentsByCategory(userId, categoryId);
      } else {
        documents = await storage.getDocuments(userId);
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      console.log("Received document data:", req.body);
      
      // Validate the document data
      const documentData = insertDocumentSchema.parse(req.body);
      
      // Create the document
      const document = await storage.createDocument(documentData);
      
      console.log("Document created:", document);
      res.status(201).json(document);
    } catch (err) {
      console.error("Error creating document:", err);
      handleZodError(err, res);
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  // Document file download route (fixes included)
  app.get("/api/documents/:id/download", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    const document = await storage.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    try {
      const fileData = document.fileData as FileData;
      if (!fileData || !fileData.data || !fileData.name || !fileData.type) {
        return res.status(400).json({ message: "Invalid file data" });
      }

      const fileBuffer = Buffer.from(fileData.data, "base64");
      res.setHeader("Content-Type", fileData.type);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileData.name}"`
      );
      res.setHeader("Content-Length", fileBuffer.length.toString());
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Error downloading file" });
    }
  });

  // Test endpoint to verify server is working
  app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working correctly" });
  });

  // QR Code routes - simplified version
  app.get("/api/users/:userId/qrcode", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Use a consistent token for the QR code to ensure it can be found
      const token = "patient-qr-code-" + userId;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Return a simple JSON response
      return res.json({
        id: 1,
        userId: userId,
        token: token,
        expiresAt: expiresAt,
        documentId: null,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error getting QR code:", error);
      return res.status(500).json({ message: "Error getting QR code" });
    }
  });
  
  app.post("/api/qrcodes", async (req, res) => {
    try {
      const qrCodeData = insertQrCodeSchema.parse(req.body);
      const qrCode = await storage.createQrCode(qrCodeData);
      res.status(201).json(qrCode);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/qrcode/:token", async (req, res) => {
    try {
      const token = req.params.token;
      console.log("Looking up QR code with token:", token);
      
      // Special handling for the default patient QR code
      if (token === "patient-qr-code" || token.startsWith("patient-qr-code-")) {
        // Extract user ID from token if it's in the format "patient-qr-code-{userId}"
        let userId = 1; // Default to user ID 1
        if (token.startsWith("patient-qr-code-")) {
          const tokenParts = token.split("-");
          const extractedId = parseInt(tokenParts[tokenParts.length - 1]);
          if (!isNaN(extractedId)) {
            userId = extractedId;
          }
        }
        
        // Get the patient with the extracted ID
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "Patient not found" });
        }
        
        // Get patient's documents
        const documents = await storage.getDocuments(userId);
        
        // Return user data and documents
        const { password, ...userWithoutPassword } = user;
        return res.json({
          user: userWithoutPassword,
          documents
        });
      }
      
      // Regular QR code lookup
      const qrCode = await storage.getQrCodeByToken(token);
      console.log("QR code lookup result:", qrCode);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found or expired" });
      }
      
      // Check if QR code is expired
      if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
        return res.status(410).json({ message: "QR code has expired" });
      }
      
      // Get user data
      const user = await storage.getUser(qrCode.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's documents
      const documents = await storage.getDocuments(qrCode.userId);
      
      // Return user data and documents
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        documents
      });
    } catch (error) {
      console.error("Error accessing patient data:", error);
      res.status(500).json({ message: "Error accessing patient data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
