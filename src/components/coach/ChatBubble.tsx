import { ChatMessage } from "@/types/coach";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-heart/10" : "bg-sunny/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-heart" />
        ) : (
          <Bot className="h-4 w-4 text-cat-dark" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-lg p-3 text-sm ${
          isUser
            ? "bg-heart text-white"
            : "bg-white border border-border text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
