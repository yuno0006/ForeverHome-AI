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
        <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-coral/20 shadow-md shadow-coral/10 bg-white">
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
        className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed transition-all duration-300 hover:shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-coral to-coral-deep text-white rounded-2xl rounded-tr-sm shadow-md shadow-coral/20"
            : "bg-white/90 backdrop-blur-md border border-white/60 text-cocoa rounded-2xl rounded-tl-sm shadow-md shadow-cocoa/5"
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
