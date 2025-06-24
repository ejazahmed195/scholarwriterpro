import { GoogleGenAI } from "@google/genai";
import type { ParaphraseRequest } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

interface ParaphraseResult {
  paraphrasedText: string;
  highlights: Array<{
    start: number;
    end: number;
    type: 'synonym' | 'grammar' | 'tone';
  }> | null;
}

interface HighlightChange {
  original: string;
  paraphrased: string;
  type: 'synonym' | 'grammar' | 'tone';
  startIndex: number;
  endIndex: number;
}

export async function paraphraseText(request: ParaphraseRequest): Promise<ParaphraseResult> {
  try {
    const { text, mode, language, citationFormat, styleMatching } = request;

    // Create mode-specific prompt
    const modePrompts = {
      academic: "Rewrite this text in an academic style, using scholarly language, formal tone, and maintaining citation integrity. Focus on clarity, precision, and academic conventions.",
      formal: "Rewrite this text in a formal professional style, using polished language appropriate for business or official communications.",
      creative: "Rewrite this text in a creative and engaging style, using varied sentence structures, vivid language, and compelling expressions while maintaining the core meaning.",
      seo: "Rewrite this text optimized for search engines, using relevant keywords naturally, improving readability, and maintaining engaging content structure.",
      simplify: "Rewrite this text in simple, clear language that is easy to understand for beginners, using shorter sentences and common vocabulary."
    };

    const systemPrompt = `You are an expert paraphrasing assistant specializing in ${mode} writing style. 

Your task is to:
1. Rewrite the provided text according to the specified mode: ${modePrompts[mode]}
2. Preserve any citations in ${citationFormat} format exactly as they appear
3. Maintain the original meaning and key information
4. Generate appropriate highlights for changes made
5. Ensure the output is in ${language} language
6. Provide detailed change tracking for visualization

IMPORTANT: Preserve all in-text citations (Author, Year), reference numbers [1], and bibliographic information exactly as they appear in the original text.

Respond with JSON in this exact format:
{
  "paraphrasedText": "the rewritten text",
  "changes": [
    {
      "original": "original phrase",
      "paraphrased": "rewritten phrase", 
      "type": "synonym|grammar|tone",
      "startIndex": number,
      "endIndex": number
    }
  ]
}

Change types:
- "synonym": Word or phrase replacements with similar meaning
- "grammar": Grammatical improvements, sentence restructuring
- "tone": Changes in writing style, formality, or voice`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            paraphrasedText: { type: "string" },
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  paraphrased: { type: "string" },
                  type: { type: "string", enum: ["synonym", "grammar", "tone"] },
                  startIndex: { type: "number" },
                  endIndex: { type: "number" }
                },
                required: ["original", "paraphrased", "type", "startIndex", "endIndex"]
              }
            }
          },
          required: ["paraphrasedText", "changes"]
        }
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Please paraphrase the following text:\n\n${text}` }]
        }
      ]
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(rawJson);
    
    // Convert changes to highlights format
    const highlights = generateHighlights(result.paraphrasedText, result.changes || []);

    return {
      paraphrasedText: result.paraphrasedText,
      highlights
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    
    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Gemini API key. Please check your API configuration.");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later or upgrade your plan.");
      } else if (error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please wait before making another request.");
      } else {
        throw new Error(`Paraphrasing failed: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred during paraphrasing");
    }
  }
}

function generateHighlights(
  paraphrasedText: string, 
  changes: HighlightChange[]
): Array<{ start: number; end: number; type: 'synonym' | 'grammar' | 'tone' }> {
  const highlights: Array<{ start: number; end: number; type: 'synonym' | 'grammar' | 'tone' }> = [];
  
  // Sort changes by their position in the paraphrased text
  const sortedChanges = changes.sort((a, b) => a.startIndex - b.startIndex);
  
  for (const change of sortedChanges) {
    // Find the paraphrased phrase in the text
    const phraseIndex = paraphrasedText.indexOf(change.paraphrased, change.startIndex);
    
    if (phraseIndex !== -1) {
      highlights.push({
        start: phraseIndex,
        end: phraseIndex + change.paraphrased.length,
        type: change.type
      });
    }
  }
  
  // Remove overlapping highlights and merge adjacent ones of the same type
  return mergeOverlappingHighlights(highlights);
}

function mergeOverlappingHighlights(
  highlights: Array<{ start: number; end: number; type: 'synonym' | 'grammar' | 'tone' }>
): Array<{ start: number; end: number; type: 'synonym' | 'grammar' | 'tone' }> {
  if (highlights.length === 0) return highlights;
  
  // Sort by start position
  highlights.sort((a, b) => a.start - b.start);
  
  const merged: Array<{ start: number; end: number; type: 'synonym' | 'grammar' | 'tone' }> = [];
  let current = highlights[0];
  
  for (let i = 1; i < highlights.length; i++) {
    const next = highlights[i];
    
    // If highlights overlap or are adjacent and of the same type, merge them
    if (next.start <= current.end && next.type === current.type) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = next;
    }
  }
  
  merged.push(current);
  return merged;
}

// Additional utility function for style matching (future enhancement)
export async function analyzeWritingStyle(sampleText: string): Promise<string> {
  try {
    const systemPrompt = `Analyze the writing style of the provided text and create a detailed style profile that can be used to match this style in future paraphrasing tasks.

Consider:
- Sentence structure and length patterns
- Vocabulary level and complexity
- Tone and formality
- Use of transitions and connectives
- Paragraph organization
- Voice (active/passive)
- Technical terminology usage

Provide a concise style description that captures the key characteristics.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Analyze the writing style of this text:\n\n${sampleText}` }]
        }
      ]
    });

    return response.text || "Unable to analyze writing style";
    
  } catch (error) {
    console.error("Style analysis error:", error);
    throw new Error("Failed to analyze writing style");
  }
}
