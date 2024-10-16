import React, { useState } from "react";
import { Input, Button } from "@nextui-org/react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex items-center">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        disabled={isDisabled}
        className="mr-2 flex-grow"
      />
      <Button onClick={handleSend} disabled={isDisabled || !message.trim()}>
        Send
      </Button>
    </div>
  );
};

export default ChatInput;
