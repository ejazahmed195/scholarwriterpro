import * as fs from "fs";
import * as path from "path";

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'text/plain':
        return await fs.promises.readFile(filePath, 'utf-8');
      
      case 'application/pdf':
        // For PDF extraction, we'd typically use a library like pdf-parse
        // For now, return a placeholder that indicates PDF processing is needed
        throw new Error("PDF text extraction requires additional setup. Please convert to TXT format.");
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // For DOCX extraction, we'd typically use a library like mammoth
        // For now, return a placeholder that indicates DOCX processing is needed
        throw new Error("DOCX text extraction requires additional setup. Please convert to TXT format.");
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (await fileExists(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
    // Don't throw here as cleanup failures shouldn't break the main flow
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Cleanup expired files from the uploads directory
export async function cleanupExpiredFiles(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    if (!await fileExists(uploadsDir)) {
      return;
    }
    
    const files = await fs.promises.readdir(uploadsDir);
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await cleanupFile(filePath);
      }
    }
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
}

// Start cleanup interval
setInterval(cleanupExpiredFiles, 30 * 60 * 1000); // Run every 30 minutes
