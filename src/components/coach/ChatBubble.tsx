import Image from "next/image";
import { ChatMessage } from "@/types/coach";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ChatBubbleProps {
  message: ChatMessage;
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { user, userDoc } = useAuth();
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
        {isUser ? (
          user?.photoURL ? (
            <Image src={user.photoURL} alt="You" width={28} height={28} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-coral flex items-center justify-center text-white text-[10px] font-bold">
              {getInitials(userDoc?.displayName || user?.displayName)}
            </div>
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-coral to-honey flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
      <div
        className={`max-w-[78%] px-3.5 py-2 text-sm rounded-2xl ${
          isUser
            ? "bg-coral text-white rounded-tr-sm"
            : "bg-white border border-cocoa/10 text-cocoa rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
