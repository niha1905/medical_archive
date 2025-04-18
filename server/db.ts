import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// For password hashing
export const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  // Check if stored password is valid
  if (!stored || !stored.includes(".")) {
    console.error("Invalid stored password format");
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  
  // Additional validation
  if (!hashed || !salt) {
    console.error("Invalid password hash or salt");
    return false;
  }
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return hashedBuf.length === suppliedBuf.length && timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Function to initialize the database with default data
export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Check if there are any users in the database
    const users = await db.select().from(schema.users);
    
    // Only seed the database if there are no users
    if (users.length === 0) {
      console.log("No users found. Creating default users...");
      
      // Create default patient
      const patientId = await createDefaultUser({
        username: "patient",
        password: "password123",
        displayName: "John Doe",
        email: "patient@example.com",
        role: "patient"
      });
      
      // Create default doctor
      const doctorId = await createDefaultUser({
        username: "doctor",
        password: "password123",
        displayName: "Dr. Jane Smith",
        email: "doctor@example.com",
        role: "doctor"
      });
      
      // Create default categories for the patient
      if (patientId) {
        console.log("Creating default categories...");
        const defaultCategories = [
          { name: 'Lab Reports', userId: patientId },
          { name: 'Prescriptions', userId: patientId },
          { name: 'X-Rays', userId: patientId },
          { name: 'Vaccinations', userId: patientId }
        ];
        
        for (const category of defaultCategories) {
          await db.insert(schema.categories).values({
            name: category.name,
            userId: category.userId,
            count: 0
          });
        }
        
        // Create default medical condition for the patient
        console.log("Creating default medical condition...");
        await db.insert(schema.medicalConditions).values({
          userId: patientId,
          summary: "Patient has a history of hypertension and mild asthma. Currently on medication for blood pressure management. Last checkup showed normal vitals with slight concerns about cholesterol levels.",
          lastUpdated: new Date()
        });
      }
      
      console.log("Database initialization complete!");
    } else {
      console.log("Database already contains users. Skipping initialization.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

async function createDefaultUser(userData: { 
  username: string, 
  password: string, 
  displayName: string, 
  email: string, 
  role: "patient" | "doctor" 
}) {
  // Hash the password
  const hashedPassword = await hashPassword(userData.password);
  
  // Insert the user
  const [user] = await db.insert(schema.users).values({
    username: userData.username,
    password: hashedPassword,
    displayName: userData.displayName,
    email: userData.email,
    role: userData.role,
    createdAt: new Date()
  }).returning({ id: schema.users.id });
  
  console.log(`Created ${userData.role} user: ${userData.username}`);
  return user?.id;
}