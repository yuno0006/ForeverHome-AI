"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Send, Sparkles, ImagePlus, X, ArrowRight, Loader2, LogIn } from "lucide-react";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imagePreview?: string;
}

const SUGGESTED_QUESTIONS = [
  "How does ForeverHome AI work?",
  "How does the compatibility quiz work?",
  "What happens after I adopt a cat?",
];

// Illustrative — matches the same fixed demo entry used on the dashboard
// until real per-user adoption tracking exists.
const demoActiveAdoption = { id: "barnaby-adoption-1", catName: "Barnaby" };

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function GeneralAssistantPage() {
  const { user, userDoc } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText ?? inputValue;
    if (!text.trim() && !imageFile) return;
    if (sending) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim() || "Take a look at this photo of my cat",
      timestamp: new Date().toISOString(),
      imagePreview: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSending(true);

    try {
      let imagePayload: { data: string; mimeType: string } | undefined;
      if (imageFile && imagePreview) {
        const base64 = imagePreview.split(",")[1];
        imagePayload = { data: base64, mimeType: imageFile.type };
      }
      clearImage();

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          image: imagePayload,
          uid: user?.uid || null,
        }),
      });
      const data = await res.json();
      const assistantMsg: AssistantMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: "assistant",
          content: "Something went wrong on my end. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral/20 to-honey/20 flex items-center justify-center border border-cocoa/10">
            <Sparkles className="w-4.5 h-4.5 text-coral" />
          </div>
          <div>
            <h1 className="font-display text-lg font-black text-cocoa leading-tight">ForeverHome Assistant</h1>
            <p className="text-xs text-cocoa/50 font-medium">Ask me anything about adopting a cat</p>
          </div>
        </div>
      </div>

      {/* Active adoption banner */}
      {user && (
        <Link href={`/coach/${demoActiveAdoption.id}`} className="block mb-4">
          <div className="flex items-center gap-3 bg-coral/5 border border-coral/20 rounded-xl px-4 py-3 hover:bg-coral/10 transition-colors">
            <span className="text-lg">🐾</span>
            <p className="text-sm font-bold text-cocoa flex-1">
              Continue {demoActiveAdoption.catName}&apos;s 9 Lives journey
            </p>
            <ArrowRight className="w-4 h-4 text-coral" />
          </div>
        </Link>
      )}

      {/* Guest note */}
      {!user && (
        <div className="flex items-center gap-2 bg-honey/10 border border-honey/25 rounded-xl px-4 py-2.5 mb-4 text-xs text-cocoa/70">
          <LogIn className="w-3.5 h-3.5 text-honey shrink-0" />
          <span>
            You&apos;re chatting as a guest.{" "}
            <Link href="/login" className="font-bold underline hover:text-cocoa">Sign in</Link>{" "}
            to save your progress and unlock the 9 Lives Coach after adopting.
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className="py-6">
            <p className="text-sm text-cocoa/50 font-medium mb-3">Try asking:</p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="block w-full text-left text-sm font-medium text-cocoa bg-white border border-cocoa/10 rounded-xl px-4 py-2.5 hover:border-coral/30 hover:bg-coral/5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
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

              {/* Bubble */}
              <div
                className={`max-w-[78%] px-3.5 py-2 text-sm rounded-2xl ${
                  isUser
                    ? "bg-coral text-white rounded-tr-sm"
                    : "bg-white border border-cocoa/10 text-cocoa rounded-tl-sm"
                }`}
              >
                {msg.imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={msg.imagePreview} alt="Uploaded cat" className="rounded-lg mb-1.5 max-h-40 object-cover" />
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-coral to-honey flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-cocoa/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cocoa/40" />
              <span className="text-xs text-cocoa/40">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Image preview strip */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Selected" className="h-16 w-16 object-cover rounded-lg border border-cocoa/15" />
          <button
            onClick={clearImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cocoa text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-cocoa/10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!!imageFile || sending}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-cocoa/50 hover:text-coral hover:bg-coral/5 transition-colors disabled:opacity-40"
          title="Attach a photo of your cat"
        >
          <ImagePlus className="w-4.5 h-4.5" />
        </button>
        <Input
          placeholder="Ask about adopting, the quiz, or anything else..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          className="flex-1 text-sm"
        />
        <Button
          onClick={() => handleSend()}
          disabled={sending || (!inputValue.trim() && !imageFile)}
          size="icon"
          className="shrink-0 bg-coral hover:bg-coral-deep text-white rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
