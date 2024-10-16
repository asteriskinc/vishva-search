import { useState } from 'react';
import { generateChatWindow } from "@/utils/openaiStream";
import { readStreamableValue } from "ai/rsc";
import { CoreMessage } from 'ai';

const useChatWindowStream = (url?: string) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamMessage = async (messages: CoreMessage[], onToken: (token: string | undefined) => void) => {
    setIsStreaming(true);
    try {
      const { output } = await generateChatWindow(messages, url || '');
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

export default useChatWindowStream;