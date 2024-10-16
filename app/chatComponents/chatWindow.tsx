import React, { useState } from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
import ChatMessage from "./chatMessage";
import ChatInput from "./chatInput";
import ContextCard from "./contextCard";
import useChatWindowStream from "@/utils/useChatWindowStream";

interface ChatWindowProps {
  url?: string;
  onClose: () => void;
  contextInfo: Array<{
    websiteName: string;
    title: string;
    snippet: string;
    imageUrl: string;
  }>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  url,
  onClose,
  contextInfo,
}) => {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const { streamMessage, isStreaming } = useChatWindowStream(url);

  const handleSendMessage = async (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    const assistantMessage = { role: "assistant" as const, content: "" };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    await streamMessage(messages, (token) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].content += token;
        return newMessages;
      });
    });
  };

  return (
    <Card className="flex h-full w-full flex-col rounded-lg border border-white/40 bg-transparent">
      <CardBody className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Chat</h3>
          <Button size="sm" variant="bordered" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mb-4 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {contextInfo.map((info, index) => (
              <ContextCard key={index} {...info} />
            ))}
          </div>
        </div>

        <div className="mb-4 flex-grow overflow-y-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isDisabled={isStreaming} />
      </CardBody>
    </Card>
  );
};

export default ChatWindow;
