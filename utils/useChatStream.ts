import { useState } from 'react';
import { generate } from "@/utils/openaiStream";
import { readStreamableValue } from "ai/rsc";

const useChatStream = (url?: string) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamMessage = async (message: string, onToken: (token: string | undefined) => void) => {
    setIsStreaming(true);
    try {
      const { output } = await generate(message, url || '');
      for await (const delta of readStreamableValue(output)) {
        onToken(delta);
      }
    } catch (error) {
      console.error("Error in chat stream:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return { streamMessage, isStreaming };
};

export default useChatStream;