import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { paraphraseRequestSchema } from "@shared/schema";
import { paraphraseText } from "./services/gemini";
import { extractTextFromFile, cleanupFile } from "./services/fileHandler";
import { nanoid } from "nanoid";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Paraphrase text endpoint
  app.post("/api/paraphrase", async (req, res) => {
    try {
      const validatedData = paraphraseRequestSchema.parse(req.body);
      
      const sessionId = nanoid();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2); // Expire in 2 hours
      
      // Create session
      const session = await storage.createParaphrasingSession({
        sessionId,
        originalText: validatedData.text,
        paraphrasedText: null,
        mode: validatedData.mode,
        language: validatedData.language,
        citationFormat: validatedData.citationFormat,
        highlights: null,
        expiresAt,
      });
      
      // Paraphrase the text
      const result = await paraphraseText(validatedData);
      
      // Update session with results
      const updatedSession = await storage.updateParaphrasingSession(sessionId, {
        paraphrasedText: result.paraphrasedText,
        highlights: result.highlights,
      });
      
      res.json({
        sessionId,
        originalText: validatedData.text,
        paraphrasedText: result.paraphrasedText,
        highlights: result.highlights,
        mode: validatedData.mode,
        language: validatedData.language,
        citationFormat: validatedData.citationFormat,
      });
      
    } catch (error) {
      console.error("Paraphrase error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to paraphrase text", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred" 
        });
      }
    }
  });
  
  // Upload file endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const sessionId = nanoid();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2); // Expire in 2 hours
      
      // Extract text from file
      const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
      
      // Store file info
      const uploadedFile = await storage.createUploadedFile({
        sessionId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        extractedText,
        expiresAt,
      });
      
      res.json({
        sessionId,
        fileName: req.file.originalname,
        extractedText,
        fileSize: req.file.size,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      
      // Clean up file if upload failed
      if (req.file) {
        await cleanupFile(req.file.path);
      }
      
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to process uploaded file", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred during file upload" 
        });
      }
    }
  });
  
  // Get session endpoint
  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getParaphrasingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.expiresAt < new Date()) {
        return res.status(410).json({ message: "Session expired" });
      }
      
      res.json(session);
      
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ message: "Failed to retrieve session" });
    }
  });
  
  // Clear session endpoint
  app.delete("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Delete associated files from filesystem
      const files = await storage.getUploadedFilesBySession(sessionId);
      for (const file of files) {
        await cleanupFile(file.filePath);
      }
      
      // Delete from database (includes files and session)
      await (storage as any).deleteUserSession(sessionId);
      
      res.json({ message: "Session cleared successfully" });
      
    } catch (error) {
      console.error("Clear session error:", error);
      res.status(500).json({ message: "Failed to clear session" });
    }
  });

  // Endpoint for when user leaves the page (beforeunload)
  app.post("/api/session/:sessionId/cleanup", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Delete associated files from filesystem
      const files = await storage.getUploadedFilesBySession(sessionId);
      for (const file of files) {
        await cleanupFile(file.filePath);
      }
      
      // Delete user session data from database
      await (storage as any).deleteUserSession(sessionId);
      
      res.json({ message: "User session cleaned up successfully" });
      
    } catch (error) {
      console.error("Session cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
