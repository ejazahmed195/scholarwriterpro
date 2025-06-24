import { users, paraphrasingSessions, uploadedFiles, type User, type InsertUser, type ParaphrasingSession, type InsertParaphrasingSession, type UploadedFile, type InsertUploadedFile } from "@shared/schema";
import { db } from "./db";
import { eq, lt } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createParaphrasingSession(session: InsertParaphrasingSession): Promise<ParaphrasingSession>;
  getParaphrasingSession(sessionId: string): Promise<ParaphrasingSession | undefined>;
  updateParaphrasingSession(sessionId: string, updates: Partial<ParaphrasingSession>): Promise<ParaphrasingSession | undefined>;
  
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFilesBySession(sessionId: string): Promise<UploadedFile[]>;
  deleteExpiredFiles(): Promise<void>;
  deleteFilesBySession(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Start cleanup interval - run every 5 minutes
    setInterval(() => {
      this.deleteExpiredFiles();
    }, 5 * 60 * 1000);
    
    // Start cache cleanup - run every 30 minutes to optimize space
    setInterval(() => {
      this.optimizeDatabase();
    }, 30 * 60 * 1000);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createParaphrasingSession(session: InsertParaphrasingSession): Promise<ParaphrasingSession> {
    const [newSession] = await db
      .insert(paraphrasingSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getParaphrasingSession(sessionId: string): Promise<ParaphrasingSession | undefined> {
    const [session] = await db
      .select()
      .from(paraphrasingSessions)
      .where(eq(paraphrasingSessions.sessionId, sessionId));
    return session || undefined;
  }

  async updateParaphrasingSession(sessionId: string, updates: Partial<ParaphrasingSession>): Promise<ParaphrasingSession | undefined> {
    const [updatedSession] = await db
      .update(paraphrasingSessions)
      .set(updates)
      .where(eq(paraphrasingSessions.sessionId, sessionId))
      .returning();
    return updatedSession || undefined;
  }

  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const [newFile] = await db
      .insert(uploadedFiles)
      .values(file)
      .returning();
    return newFile;
  }

  async getUploadedFilesBySession(sessionId: string): Promise<UploadedFile[]> {
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.sessionId, sessionId));
    return files;
  }

  async deleteExpiredFiles(): Promise<void> {
    const now = new Date();
    
    try {
      // Delete expired uploaded files
      await db
        .delete(uploadedFiles)
        .where(lt(uploadedFiles.expiresAt, now));
      
      // Delete expired paraphrasing sessions
      await db
        .delete(paraphrasingSessions)
        .where(lt(paraphrasingSessions.expiresAt, now));
      
      console.log('Cleanup: Expired files and sessions deleted');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async deleteFilesBySession(sessionId: string): Promise<void> {
    await db
      .delete(uploadedFiles)
      .where(eq(uploadedFiles.sessionId, sessionId));
  }

  // Cache optimization to save database space
  async optimizeDatabase(): Promise<void> {
    try {
      // Delete sessions older than 24 hours regardless of expiry
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      await db
        .delete(paraphrasingSessions)
        .where(lt(paraphrasingSessions.createdAt, oneDayAgo));
      
      await db
        .delete(uploadedFiles)
        .where(lt(uploadedFiles.uploadedAt, oneDayAgo));
      
      console.log('Database optimization: Old records cleaned up');
    } catch (error) {
      console.error('Error during database optimization:', error);
    }
  }

  // Method to delete user data when they leave the page
  async deleteUserSession(sessionId: string): Promise<void> {
    try {
      // Delete all files associated with the session
      await this.deleteFilesBySession(sessionId);
      
      // Delete the paraphrasing session
      await db
        .delete(paraphrasingSessions)
        .where(eq(paraphrasingSessions.sessionId, sessionId));
      
      console.log(`User session ${sessionId} data deleted`);
    } catch (error) {
      console.error('Error deleting user session:', error);
    }
  }
}

export const storage = new DatabaseStorage();
