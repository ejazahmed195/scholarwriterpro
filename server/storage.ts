import { users, paraphrasingSessions, uploadedFiles, type User, type InsertUser, type ParaphrasingSession, type InsertParaphrasingSession, type UploadedFile, type InsertUploadedFile } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private paraphrasingSessions: Map<string, ParaphrasingSession>;
  private uploadedFiles: Map<number, UploadedFile>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentFileId: number;

  constructor() {
    this.users = new Map();
    this.paraphrasingSessions = new Map();
    this.uploadedFiles = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentFileId = 1;
    
    // Start cleanup interval
    setInterval(() => {
      this.deleteExpiredFiles();
    }, 60000); // Run every minute
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createParaphrasingSession(session: InsertParaphrasingSession): Promise<ParaphrasingSession> {
    const id = this.currentSessionId++;
    const newSession: ParaphrasingSession = {
      ...session,
      id,
      createdAt: new Date(),
    };
    this.paraphrasingSessions.set(session.sessionId, newSession);
    return newSession;
  }

  async getParaphrasingSession(sessionId: string): Promise<ParaphrasingSession | undefined> {
    return this.paraphrasingSessions.get(sessionId);
  }

  async updateParaphrasingSession(sessionId: string, updates: Partial<ParaphrasingSession>): Promise<ParaphrasingSession | undefined> {
    const session = this.paraphrasingSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.paraphrasingSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const id = this.currentFileId++;
    const newFile: UploadedFile = {
      ...file,
      id,
      uploadedAt: new Date(),
    };
    this.uploadedFiles.set(id, newFile);
    return newFile;
  }

  async getUploadedFilesBySession(sessionId: string): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values()).filter(
      (file) => file.sessionId === sessionId
    );
  }

  async deleteExpiredFiles(): Promise<void> {
    const now = new Date();
    const expiredFiles = Array.from(this.uploadedFiles.entries()).filter(
      ([_, file]) => file.expiresAt < now
    );
    
    for (const [id, _] of expiredFiles) {
      this.uploadedFiles.delete(id);
    }
    
    // Also clean up expired sessions
    const expiredSessions = Array.from(this.paraphrasingSessions.entries()).filter(
      ([_, session]) => session.expiresAt < now
    );
    
    for (const [sessionId, _] of expiredSessions) {
      this.paraphrasingSessions.delete(sessionId);
    }
  }

  async deleteFilesBySession(sessionId: string): Promise<void> {
    const sessionFiles = Array.from(this.uploadedFiles.entries()).filter(
      ([_, file]) => file.sessionId === sessionId
    );
    
    for (const [id, _] of sessionFiles) {
      this.uploadedFiles.delete(id);
    }
  }
}

export const storage = new MemStorage();
