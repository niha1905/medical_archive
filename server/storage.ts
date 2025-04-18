import { documents, type Document, type InsertDocument, DOCUMENT_CATEGORIES, FILE_TYPES, users, type User, type InsertUser } from "@shared/schema";
import { sub, isAfter, parseISO } from "date-fns";

// Modify the interface with CRUD methods for documents
export interface IStorage {
  // User methods (from original template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Filter documents
  filterDocuments(options: {
    category?: string;
    dateFilter?: string;
    searchTerm?: string;
  }): Promise<Document[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private userCurrentId: number;
  private documentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.userCurrentId = 1;
    this.documentCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentCurrentId++;
    const document: Document = { ...insertDocument, id };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    
    if (!existingDocument) {
      return undefined;
    }
    
    const updatedDocument = { ...existingDocument, ...updateData };
    this.documents.set(id, updatedDocument);
    
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async filterDocuments(options: {
    category?: string;
    dateFilter?: string;
    searchTerm?: string;
  }): Promise<Document[]> {
    let filteredDocuments = Array.from(this.documents.values());
    
    // Filter by category
    if (options.category && DOCUMENT_CATEGORIES.includes(options.category as any)) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.category === options.category
      );
    }
    
    // Filter by date
    if (options.dateFilter) {
      const now = new Date();
      let dateThreshold: Date | null = null;
      
      switch (options.dateFilter) {
        case 'last_month':
          dateThreshold = sub(now, { months: 1 });
          break;
        case 'last_3_months':
          dateThreshold = sub(now, { months: 3 });
          break;
        case 'last_6_months':
          dateThreshold = sub(now, { months: 6 });
          break;
        case 'last_year':
          dateThreshold = sub(now, { years: 1 });
          break;
        // custom range would be handled separately with custom dates
      }
      
      if (dateThreshold) {
        filteredDocuments = filteredDocuments.filter(doc => 
          isAfter(parseISO(doc.date), dateThreshold!)
        );
      }
    }
    
    // Filter by search term
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) || 
        doc.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date (newest first)
    return filteredDocuments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}

export const storage = new MemStorage();
