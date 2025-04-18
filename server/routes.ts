import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertDocumentSchema, 
  insertQrCodeSchema
} from "@shared/schema";
import { randomBytes } from "crypto";
import { ZodError } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Helper function to handle validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    
    console.error("Unexpected error:", err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  };

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Category routes
  app.get("/api/users/:userId/categories", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const categories = await storage.getCategories(userId);
    res.json(categories);
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

  // Document routes
  app.get("/api/users/:userId/documents", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    let documents;
    if (categoryId && !isNaN(categoryId)) {
      documents = await storage.getDocumentsByCategory(userId, categoryId);
    } else {
      documents = await storage.getDocuments(userId);
    }
    
    res.json(documents);
  });

  app.get("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }
    
    const document = await storage.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(document);
  });

  app.post("/api/documents", async (req, res) => {
    try {
      // Parse the document data with date conversion
      const documentData = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      // Convert date string to Date object if present
      const updateData = req.body;
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      
      const document = await storage.updateDocument(id, updateData);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }
    
    const success = await storage.deleteDocument(id);
    
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.status(204).end();
  });

  // QR Code routes
  app.get("/api/users/:userId/qrcode", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    let qrCode = await storage.getQrCodeByUserId(userId);
    
    // If no QR code exists, create one
    if (!qrCode) {
      const token = randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days
      
      qrCode = await storage.createQrCode({
        userId,
        token,
        expiresAt
      });
    }
    
    res.json(qrCode);
  });

  app.get("/api/qrcode/:token", async (req, res) => {
    const { token } = req.params;
    
    const qrCode = await storage.getQrCodeByToken(token);
    
    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }
    
    // Check if QR code is expired
    if (qrCode.expiresAt && new Date() > new Date(qrCode.expiresAt)) {
      return res.status(410).json({ message: "QR code expired" });
    }
    
    // Get user details
    const user = await storage.getUser(qrCode.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's documents
    const documents = await storage.getDocuments(user.id);
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      documents
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
