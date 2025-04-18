import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, filterSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import QRCode from "qrcode";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const api = "/api";

  // Get all documents
  app.get(`${api}/documents`, async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve documents" });
    }
  });

  // Get a single document by ID
  app.get(`${api}/documents/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve document" });
    }
  });

  // Create a new document
  app.post(`${api}/documents`, async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString()
      });
      
      const newDocument = await storage.createDocument(validatedData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update a document
  app.patch(`${api}/documents/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const existingDocument = await storage.getDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Validate partial update data
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      
      const updatedDocument = await storage.updateDocument(id, validatedData);
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete a document
  app.delete(`${api}/documents/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Filter documents
  app.get(`${api}/documents/filter`, async (req, res) => {
    try {
      const { category, date, search } = req.query;
      
      // Validate filter params
      const validatedFilters = filterSchema.parse({
        category: category || "",
        date: date || "",
        search: search || ""
      });
      
      const filteredDocuments = await storage.filterDocuments({
        category: validatedFilters.category,
        dateFilter: validatedFilters.date,
        searchTerm: validatedFilters.search
      });
      
      res.json(filteredDocuments);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to filter documents" });
    }
  });

  // Generate QR code for all documents
  app.get(`${api}/qrcode`, async (req, res) => {
    try {
      // In a real application, this would be tied to a user ID
      // For this app, we'll generate a QR code with a data URL that points to the frontend
      const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
      const qrData = `${baseUrl}/view-documents`;
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData);
      
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
