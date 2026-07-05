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
        className={`max-w-[80%] p-4 text-sm shadow-[2px_2px_0px_0px_rgba(42,29,20,0.1)] font-bold ${
          isUser
            ? "bg-heart text-white rounded-3xl rounded-tr-sm border-2 border-heart"
            : "bg-white border-2 border-cocoa/20 text-cat-dark rounded-3xl rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
