import { 
  users, User, InsertUser, 
  categories, Category, InsertCategory,
  documents, Document, InsertDocument,
  qrCodes, QrCode, InsertQrCode,
  medicalConditions, MedicalCondition, InsertMedicalCondition,
  DocumentWithCategory
} from "@shared/schema";
import { randomBytes } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: "patient" | "doctor"): Promise<User[]>;
  
  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategoryCount(id: number, increment: boolean): Promise<Category | undefined>;
  
  // Document operations
  getDocuments(userId: number): Promise<DocumentWithCategory[]>;
  getDocumentsByCategory(userId: number, categoryId: number): Promise<DocumentWithCategory[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // QR Code operations
  getQrCodeByUserId(userId: number): Promise<QrCode | undefined>;
  getQrCodeByToken(token: string): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  deleteQrCode(id: number): Promise<boolean>;
  
  // Medical Condition operations
  getMedicalCondition(userId: number): Promise<MedicalCondition | undefined>;
  createMedicalCondition(condition: InsertMedicalCondition): Promise<MedicalCondition>;
  updateMedicalCondition(userId: number, summary: string): Promise<MedicalCondition | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private documents: Map<number, Document>;
  private qrCodes: Map<number, QrCode>;
  private medicalConditions: Map<number, MedicalCondition>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private documentIdCounter: number;
  private qrCodeIdCounter: number;
  private medicalConditionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.documents = new Map();
    this.qrCodes = new Map();
    this.medicalConditions = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.documentIdCounter = 1;
    this.qrCodeIdCounter = 1;
    this.medicalConditionIdCounter = 1;
  }
  
  // Call this after the singleton is created
  initialize() {
    // Initialize with default user and categories
    this.initializeDefaults();
    return this;
  }
  
  private initializeDefaults() {
    // Create default users and add them directly for initialization
    const patientId = this.userIdCounter++;
    const doctorId = this.userIdCounter++;
    const timestamp = new Date();
    
    // Default patient - using properly hashed password
    // password123 hashed using scrypt
    const patient: User = {
      id: patientId,
      username: 'patient',
      password: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4.1234567890123456',
      displayName: 'John Doe',
      email: 'patient@example.com',
      role: 'patient',
      createdAt: timestamp
    };
    
    // Default doctor - using properly hashed password
    // password123 hashed using scrypt
    const doctor: User = {
      id: doctorId,
      username: 'doctor',
      password: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4.1234567890123456',
      displayName: 'Dr. Jane Smith',
      email: 'doctor@example.com',
      role: 'doctor',
      createdAt: timestamp
    };
    
    // Add users to the map
    this.users.set(patientId, patient);
    this.users.set(doctorId, doctor);
    
    // Create default categories for the patient
    const defaultCategories = [
      { name: 'Lab Reports', userId: patientId },
      { name: 'Prescriptions', userId: patientId },
      { name: 'X-Rays', userId: patientId },
      { name: 'Vaccinations', userId: patientId }
    ];
    
    // Add categories and track their IDs
    const categoryIds: Record<string, number> = {};
    defaultCategories.forEach((cat) => {
      const categoryId = this.categoryIdCounter++;
      categoryIds[cat.name] = categoryId;
      
      const category: Category = {
        id: categoryId,
        name: cat.name,
        userId: cat.userId,
        count: 0
      };
      this.categories.set(categoryId, category);
    });
    
    // Create default medical condition
    const medicalConditionId = this.medicalConditionIdCounter++;
    const medicalCondition: MedicalCondition = {
      id: medicalConditionId,
      userId: patientId,
      summary: "Patient has a history of hypertension and mild asthma. Currently on medication for blood pressure management. Last checkup showed normal vitals with slight concerns about cholesterol levels.",
      lastUpdated: timestamp
    };
    this.medicalConditions.set(medicalConditionId, medicalCondition);
    
    // Create default QR code for the patient
    const qrCodeId = this.qrCodeIdCounter++;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days
    
    const qrCode: QrCode = {
      id: qrCodeId,
      userId: patientId,
      token: "patient-qr-code",
      expiresAt: expiresAt,
      documentId: null,
      createdAt: timestamp
    };
    this.qrCodes.set(qrCodeId, qrCode);
    
    // Create sample documents for the patient
    const sampleDocuments = [
      {
        title: "Complete Blood Count",
        categoryId: categoryIds["Lab Reports"],
        userId: patientId,
        date: new Date(2023, 10, 15),
        notes: "Normal blood count results. All values within expected ranges.",
        fileData: {
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          name: "cbc_results.png",
          type: "image/png"
        }
      },
      {
        title: "Lipid Panel",
        categoryId: categoryIds["Lab Reports"],
        userId: patientId,
        date: new Date(2023, 9, 5),
        notes: "Cholesterol slightly elevated. Recommended dietary changes.",
        fileData: {
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          name: "lipid_panel.png",
          type: "image/png"
        }
      },
      {
        title: "Blood Pressure Medication",
        categoryId: categoryIds["Prescriptions"],
        userId: patientId,
        date: new Date(2023, 11, 1),
        notes: "Lisinopril 10mg, once daily. Refills: 3",
        fileData: {
          data: "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDM4Pj5zdHJlYW0KeJwr5HIK4TI2UzC2NFUwMFMISeFyDeEK5OICADlXBSgKZW5kc3RyZWFtCmVuZG9iago0IDAgb2JqCjw8L0NvbnRlbnRzIDUgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDYgMCBSPj4+Pi9UcmltQm94WzAgMCA1OTUgODQyXS9UeXBlL1BhZ2U+PgplbmRvYmoKMSAwIG9iago8PC9QYWdlcyAyIDAgUi9UeXBlL0NhdGFsb2c+PgplbmRvYmoKMyAwIG9iago8PC9BdXRob3IoVXNlcikgL0NyZWF0b3Io/v8ATQBpAGMAcgBvAHMAbwBmAHQArgAgAFcAbwByAGQAIABmAG8AcgAgAE0AaQBjAHIAbwBzAG8AZgB0ACAAMwA2ADUAKSAvQ3JlYXRpb25EYXRlKEQ6MjAyMzA0MTcxNTM4MjUrMDInMDAnKSAvTW9kRGF0ZShEOjIwMjMwNDE3MTUzODI1KzAyJzAwJykgL1Byb2R1Y2VyKP7/AE0AaQBjAHIAbwBzAG8AZgB0AK4AIABXAG8AcgBkACAAZgBvAHIAIABNAGkAYwByAG8AcwBvAGYAdAAgADMANgA1ACk+PgplbmRvYmoKNiAwIG9iago8PC9CYXNlRm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nL1N1YnR5cGUvVHlwZTEvVHlwZS9Gb250Pj4KZW5kb2JqCjIgMCBvYmoKPDwvQ291bnQgMS9LaWRzWzQgMCBSXS9UeXBlL1BhZ2VzPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIyMiAwMDAwMCBuIAowMDAwMDAwNjI4IDAwMDAwIG4gCjAwMDAwMDAyNjcgMDAwMDAgbiAKMDAwMDAwMDExOSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDA1MzMgMDAwMDAgbiAKdHJhaWxlcgo8PC9JbmZvIDMgMCBSL1Jvb3QgMSAwIFIvU2l6ZSA3Pj4Kc3RhcnR4cmVmCjY3OQolJUVPRgo=",
          name: "bp_prescription.pdf",
          type: "application/pdf"
        }
      },
      {
        title: "Chest X-Ray",
        categoryId: categoryIds["X-Rays"],
        userId: patientId,
        date: new Date(2023, 8, 20),
        notes: "No abnormalities detected. Lungs clear.",
        fileData: {
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          name: "chest_xray.png",
          type: "image/png"
        }
      },
      {
        title: "COVID-19 Vaccination",
        categoryId: categoryIds["Vaccinations"],
        userId: patientId,
        date: new Date(2023, 5, 10),
        notes: "Pfizer-BioNTech COVID-19 Vaccine, 2nd dose",
        fileData: {
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          name: "covid_vaccination.png",
          type: "image/png"
        }
      }
    ];
    
    // Add sample documents
    sampleDocuments.forEach(doc => {
      const docId = this.documentIdCounter++;
      const document: Document = {
        ...doc,
        id: docId,
        createdAt: timestamp
      };
      this.documents.set(docId, document);
      
      // Update category count
      const category = this.categories.get(doc.categoryId);
      if (category) {
        category.count++;
        this.categories.set(doc.categoryId, category);
      }
    });


  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const newUser: User = { 
      ...user, 
      id,
      role: user.role || 'patient', // Ensure role is set
      email: user.email || null,    // Ensure email is not undefined
      createdAt: timestamp
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.userId === userId);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = {
      ...category,
      id,
      count: 0
    };
    
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategoryCount(id: number, increment: boolean): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = {
      ...category,
      count: increment ? category.count + 1 : Math.max(0, category.count - 1)
    };
    
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  // Document operations
  async getDocuments(userId: number): Promise<DocumentWithCategory[]> {
    const userDocuments = Array.from(this.documents.values())
      .filter(doc => doc.userId === userId);
    
    return this.attachCategoryToDocuments(userDocuments);
  }
  
  async getDocumentsByCategory(userId: number, categoryId: number): Promise<DocumentWithCategory[]> {
    const documents = Array.from(this.documents.values())
      .filter(doc => doc.userId === userId && doc.categoryId === categoryId);
    
    return this.attachCategoryToDocuments(documents);
  }
  
  private async attachCategoryToDocuments(docs: Document[]): Promise<DocumentWithCategory[]> {
    const result: DocumentWithCategory[] = [];
    
    for (const doc of docs) {
      const category = await this.getCategoryById(doc.categoryId);
      if (category) {
        result.push({
          ...doc,
          categoryName: category.name
        });
      }
    }
    
    return result;
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const timestamp = new Date();
    
    const newDocument: Document = {
      ...document,
      id,
      createdAt: timestamp,
      date: typeof document.date === 'string' ? new Date(document.date) : document.date,
      fileData: document.fileData ?? null, // Ensure fileData is explicitly set
      notes: document.notes ?? null       // Ensure notes is explicitly set
    };
    
    this.documents.set(id, newDocument);
    
    // Update category count
    await this.updateCategoryCount(document.categoryId, true);
    
    return newDocument;
  }
  
  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    // If category is changing, update category counts
    if (document.categoryId && document.categoryId !== existingDocument.categoryId) {
      await this.updateCategoryCount(existingDocument.categoryId, false);
      await this.updateCategoryCount(document.categoryId, true);
    }
    
    const updatedDocument = { ...existingDocument, ...document };
    this.documents.set(id, updatedDocument);
    
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document) return false;
    
    // Update category count
    await this.updateCategoryCount(document.categoryId, false);
    
    return this.documents.delete(id);
  }
  
  // QR Code operations
  async getQrCodeByUserId(userId: number): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(
      (qrCode) => qrCode.userId === userId
    );
  }
  
  async getQrCodeByToken(token: string): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(
      (qrCode) => qrCode.token === token
    );
  }
  
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    // First check if user already has a QR code and delete it
    const existingQrCode = await this.getQrCodeByUserId(qrCode.userId);
    if (existingQrCode) {
      await this.deleteQrCode(existingQrCode.id);
    }
    
    const id = this.qrCodeIdCounter++;
    const timestamp = new Date();
    
    // Generate a random token if not provided
    const token = qrCode.token || randomBytes(16).toString('hex');
    
    const newQrCode: QrCode = {
      ...qrCode,
      id,
      token,
      createdAt: timestamp,
      expiresAt: qrCode.expiresAt ?? null,
      documentId: qrCode.documentId ?? null // Ensure documentId is explicitly set to null if undefined
    };
    
    this.qrCodes.set(id, newQrCode);
    return newQrCode;
  }
  
  async deleteQrCode(id: number): Promise<boolean> {
    return this.qrCodes.delete(id);
  }
  
  // User role operations
  async getUsersByRole(role: "patient" | "doctor"): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
  
  // Medical condition operations
  async getMedicalCondition(userId: number): Promise<MedicalCondition | undefined> {
    return Array.from(this.medicalConditions.values()).find(
      condition => condition.userId === userId
    );
  }
  
  async createMedicalCondition(condition: InsertMedicalCondition): Promise<MedicalCondition> {
    const id = this.medicalConditionIdCounter++;
    const timestamp = new Date();
    
    const newCondition: MedicalCondition = {
      ...condition,
      id,
      lastUpdated: timestamp
    };
    
    this.medicalConditions.set(id, newCondition);
    return newCondition;
  }
  
  async updateMedicalCondition(userId: number, summary: string): Promise<MedicalCondition | undefined> {
    // Find existing condition by user ID
    const existingCondition = await this.getMedicalCondition(userId);
    if (!existingCondition) return undefined;
    
    const updatedCondition: MedicalCondition = {
      ...existingCondition,
      summary,
      lastUpdated: new Date()
    };
    
    this.medicalConditions.set(existingCondition.id, updatedCondition);
    return updatedCondition;
  }
}

// Export a singleton instance
export const storage = new MemStorage().initialize();
