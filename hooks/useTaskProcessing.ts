// hooks/useTaskProcessing.ts
import { useState } from 'react';
import { Task } from '@/types/types';

export interface TaskProcessingHook {
  processQuery: (query: string) => Promise<Task | null>;
  isLoading: boolean;
  error: string | null;
}

export const useTaskProcessing = (): TaskProcessingHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processQuery = async (query: string): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/process-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data: Task = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processQuery,
    isLoading,
    error,
  };
};