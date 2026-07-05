import Image from "next/image";
import { ChatMessage } from "@/types/coach";
import { CatAvatar } from "@/components/chat/CatAvatar";
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
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-coral/30 shadow-sm">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="You"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-coral to-coral-deep flex items-center justify-center text-white text-xs font-bold">
              {getInitials(userDoc?.displayName || user?.displayName)}
            </div>
          )}
        </div>
      ) : (
        <CatAvatar size={36} />
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-coral to-coral-deep text-white rounded-2xl rounded-tr-md shadow-[3px_3px_0px_0px_rgba(42,29,20,0.15)]"
            : "bg-white border-2 border-amber-100/80 text-cocoa rounded-2xl rounded-tl-md shadow-[3px_3px_0px_0px_rgba(251,191,36,0.15)]"
        }`}
      >
        {message.isEmergency && (
          <div className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
            <span>🚨</span> MEDICAL EMERGENCY
          </div>
        )}
        {message.imagePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imagePreview}
            alt="Uploaded cat"
            className="rounded-lg mb-2 max-h-48 object-cover w-full"
          />
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
