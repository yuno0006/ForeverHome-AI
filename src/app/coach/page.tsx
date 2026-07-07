"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatAvatar } from "@/components/chat/CatAvatar";
import { useAuth } from "@/hooks/useAuth";
import { Send, ImagePlus, X, ArrowRight, Loader2, LogIn, PawPrint, Heart, ShieldAlert } from "lucide-react";

interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imagePreview?: string;
}

const SUGGESTED_QUESTIONS = [
  { icon: "🐱", text: "How does ForeverHome AI work?" },
  { icon: "🧩", text: "How does the compatibility quiz work?" },
  { icon: "🏠", text: "What happens after I adopt a cat?" },
];

// Illustrative — matches the same fixed demo entry used on the dashboard
// until real per-user adoption tracking exists.
const demoActiveAdoption = { id: "barnaby-adoption-1", catName: "Barnaby" };

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function GeneralAssistantPage() {
  const { user, userDoc } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showLoginGate, setShowLoginGate] = useState(false);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Load guest message count
  useEffect(() => {
    try {
      const count = parseInt(sessionStorage.getItem("fh_guest_msg_count") || "0", 10);
      setGuestMessageCount(isNaN(count) ? 0 : count);
    } catch { /* noop */ }
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    // Guest users: only 1 free message
    if (!user && guestMessageCount >= 1) {
      setShowLoginGate(true);
      return;
    }

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim() || "Take a look at this photo of my cat",
      timestamp: new Date().toISOString(),
      ...(imagePreview ? { imagePreview } : {}),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSending(true);

    // Track guest message count
    if (!user) {
      const newCount = guestMessageCount + 1;
      setGuestMessageCount(newCount);
      try { sessionStorage.setItem("fh_guest_msg_count", String(newCount)); } catch { /* noop */ }
    }

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
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* --- Header --- */}
      <div className="shrink-0 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-b border-amber-200/60 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <CatAvatar size={44} className="border-amber-300" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-black text-cocoa leading-tight">
              Mr. Cat 🐱
            </h1>
            <p className="text-xs text-cocoa/60 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online — here to help you find your perfect cat companion
            </p>
          </div>
          {user && (
            <Link
              href={`/coach/${demoActiveAdoption.id}`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-coral hover:text-coral-deep transition-colors bg-white/60 rounded-full px-3 py-1.5 border border-coral/20"
            >
              <Heart className="w-3.5 h-3.5" />
              {demoActiveAdoption.catName}&apos;s Coach
            </Link>
          )}
        </div>
      </div>

      {/* --- Active adoption banner (mobile) --- */}
      {user && (
        <Link href={`/coach/${demoActiveAdoption.id}`} className="sm:hidden block shrink-0">
          <div className="flex items-center gap-2.5 bg-coral/5 border-b border-coral/15 px-4 py-2.5 hover:bg-coral/10 transition-colors">
            <span className="text-base">🐾</span>
            <p className="text-xs font-bold text-cocoa flex-1">
              Continue {demoActiveAdoption.catName}&apos;s 9 Lives journey
            </p>
            <ArrowRight className="w-3.5 h-3.5 text-coral" />
          </div>
        </Link>
      )}

      {/* --- Guest note --- */}
      {!user && guestMessageCount < 1 && (
        <div className="shrink-0 flex items-center gap-2 bg-honey/10 border-b border-honey/20 px-4 py-2.5 text-xs text-cocoa/70">
          <LogIn className="w-3.5 h-3.5 text-honey shrink-0" />
          <span>
            <strong>1 free message</strong> as a guest.{" "}
            <Link href="/login" className="font-bold underline hover:text-cocoa">
              Sign in
            </Link>{" "}
            to unlock unlimited chats and the 9 Lives Coach after adopting.
          </span>
        </div>
      )}
      {/* --- Login gate after 1 message --- */}
      {showLoginGate && !user && (
        <div className="shrink-0 bg-coral/10 border-b-2 border-coral/30 px-4 py-4 text-center">
          <ShieldAlert className="h-7 w-7 text-coral mx-auto mb-1.5" />
          <h3 className="font-bold text-cocoa text-sm mb-1">Free trial complete!</h3>
          <p className="text-xs text-cocoa/70 mb-3">
            Sign in to continue chatting with Mr. Cat and save your progress.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/login?redirect=/coach">
              <Button size="sm" className="bg-coral text-white hover:bg-coral-deep rounded-full text-xs font-bold">
                <LogIn className="w-3.5 h-3.5 mr-1" /> Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="outline" className="rounded-full border-2 border-cocoa/30 text-xs font-bold">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* --- Messages area --- */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 pb-24">
        {isChatEmpty && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Welcome card */}
            <CatAvatar size={72} className="border-amber-300 mb-4 shadow-lg" />
            <h2 className="font-display text-xl font-black text-cocoa mb-1">
              Hi, I&apos;m Mr. Cat!{" "}
              <span className="inline-block animate-bounce">🐱</span>
            </h2>
            <p className="text-sm text-cocoa/50 font-medium max-w-sm mb-6">
              Ask me anything about adopting a cat, how the site works, or general cat care.
            </p>

            {/* Suggested question chips */}
            <div className="w-full max-w-md space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSend(q.text)}
                  className="w-full flex items-center gap-3 text-left text-sm font-medium text-cocoa bg-white border-2 border-amber-200/60 rounded-2xl px-4 py-3 hover:border-coral/40 hover:bg-coral/5 hover:shadow-[3px_3px_0px_0px_rgba(42,29,20,0.08)] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <span className="text-xl shrink-0">{q.icon}</span>
                  <span>{q.text}</span>
                  <ArrowRight className="w-4 h-4 text-cocoa/25 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              {isUser ? (
                <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-coral/30 shadow-sm">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="You"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-coral to-coral-deep flex items-center justify-center text-white text-[10px] font-bold">
                      {getInitials(userDoc?.displayName || user?.displayName)}
                    </div>
                  )}
                </div>
              ) : (
                <CatAvatar size={32} />
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-coral to-coral-deep text-white rounded-2xl rounded-tr-md shadow-[3px_3px_0px_0px_rgba(42,29,20,0.15)]"
                    : "bg-white border-2 border-amber-100/80 text-cocoa rounded-2xl rounded-tl-md shadow-[3px_3px_0px_0px_rgba(251,191,36,0.15)]"
                }`}
              >
                {msg.imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded cat"
                    className="rounded-lg mb-2 max-h-48 object-cover w-full"
                  />
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3">
            <CatAvatar size={32} />
            <div className="bg-white border-2 border-amber-100/80 rounded-2xl rounded-tl-md shadow-[3px_3px_0px_0px_rgba(251,191,36,0.15)] px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Image preview strip --- */}
      {imagePreview && (
        <div className="shrink-0 px-4 sm:px-6 pb-2">
          <div className="max-w-3xl mx-auto relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Selected"
              className="h-16 w-16 object-cover rounded-xl border-2 border-amber-200"
            />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cocoa text-white flex items-center justify-center hover:bg-cocoa/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* --- Input bar (floating) --- */}
      <div className="sticky bottom-0 z-20 px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-cream via-cream/95 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-white border-2 border-amber-200/80 rounded-2xl px-3 py-2.5 shadow-[0_-4px_24px_rgba(42,29,20,0.08)]">
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
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-cocoa/40 hover:text-coral hover:bg-coral/5 transition-colors disabled:opacity-30"
              title="Attach a photo of your cat"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Ask about adopting, the quiz, or anything else..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="w-full text-sm pl-4 pr-4 py-2.5 border-0 rounded-2xl focus:ring-0 bg-transparent"
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={sending || (!inputValue.trim() && !imageFile)}
              size="icon"
              className="shrink-0 w-10 h-10 bg-gradient-to-br from-coral to-coral-deep hover:from-coral-deep hover:to-coral-deep text-white rounded-full shadow-[2px_2px_0px_0px_rgba(42,29,20,0.2)] hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-cocoa/30 text-center mt-2 font-medium">
            <PawPrint className="w-3 h-3 inline-block mr-1" />
            ForeverHome AI provides general guidance, not veterinary advice.
          </p>
        </div>
      </div>
    </div>
  );
}
