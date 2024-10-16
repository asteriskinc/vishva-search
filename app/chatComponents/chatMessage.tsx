import React from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`mb-4 ${isUser ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block rounded-lg p-2 ${isUser ? "bg-blue-600 text-white" : "bg-gray-900 text-white"}`}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
