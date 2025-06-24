import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ParaphraseRequest } from "@shared/schema";

interface ParaphraseResult {
  sessionId: string;
  originalText: string;
  paraphrasedText: string;
  highlights: Array<{
    start: number;
    end: number;
    type: 'synonym' | 'grammar' | 'tone';
  }> | null;
  mode: string;
  language: string;
  citationFormat: string;
}

interface UploadResult {
  sessionId: string;
  fileName: string;
  extractedText: string;
  fileSize: number;
}

export function useParaphraser() {
  const [result, setResult] = useState<ParaphraseResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const paraphraseMutation = useMutation({
    mutationFn: async (data: ParaphraseRequest): Promise<ParaphraseResult> => {
      const response = await apiRequest("POST", "/api/paraphrase", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setCurrentSessionId(data.sessionId);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(10);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Upload failed');
      }

      setUploadProgress(100);
      const result = await response.json();
      
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
      
      return result;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  const clearSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/session/${sessionId}`);
    },
    onSuccess: () => {
      setResult(null);
      setCurrentSessionId(null);
    },
  });

  const paraphrase = useCallback((data: ParaphraseRequest) => {
    return paraphraseMutation.mutateAsync(data);
  }, [paraphraseMutation]);

  const uploadFile = useCallback((file: File) => {
    return uploadMutation.mutateAsync(file);
  }, [uploadMutation]);

  const clearSession = useCallback(() => {
    if (currentSessionId) {
      clearSessionMutation.mutate(currentSessionId);
    } else {
      setResult(null);
    }
  }, [currentSessionId, clearSessionMutation]);

  return {
    paraphrase,
    uploadFile,
    clearSession,
    result,
    isLoading: paraphraseMutation.isPending,
    uploadProgress,
    error: paraphraseMutation.error || uploadMutation.error,
  };
}
