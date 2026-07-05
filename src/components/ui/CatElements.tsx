"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * CatEarCard - Premium card with sculpted cat ears and inner ear detail
 */
interface CatEarCardProps {
  className?: string;
  children: ReactNode;
  earColor?: "coral" | "lavender" | "sage" | "cocoa" | "honey";
  hover?: boolean;
}

export function CatEarCard({
  className,
  children,
  earColor = "coral",
  hover = true,
}: CatEarCardProps) {
  const earColors = {
    coral: { outer: "bg-coral", inner: "bg-coral-light" },
    lavender: { outer: "bg-lavender", inner: "bg-lavender-light" },
    sage: { outer: "bg-sage", inner: "bg-sage-light" },
    cocoa: { outer: "bg-cocoa", inner: "bg-cocoa-soft" },
    honey: { outer: "bg-honey", inner: "bg-honey-light" },
  };
  const ear = earColors[earColor];

  return (
    <div className={cn("relative", className)}>
      {/* Left Ear */}
      <div className="absolute -top-5 left-7 z-0">
        <div className={cn("relative w-11 h-11 rotate-[-18deg]", ear.outer)} style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", borderRadius: "6px" }}>
          <div className={cn("absolute inset-x-0 bottom-0 top-[45%] mx-auto w-[50%]", ear.inner)} style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
        </div>
      </div>
      {/* Right Ear */}
      <div className="absolute -top-5 right-7 z-0">
        <div className={cn("relative w-11 h-11 rotate-[18deg]", ear.outer)} style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", borderRadius: "6px" }}>
          <div className={cn("absolute inset-x-0 bottom-0 top-[45%] mx-auto w-[50%]", ear.inner)} style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
        </div>
      </div>
      {/* Body */}
      <div
        className={cn(
          "relative z-10 bg-white border-2 border-cocoa rounded-[28px] shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] transition-all duration-300",
          hover && "hover:shadow-[9px_9px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * StickerBadge - Rotated sticker-style label
 */
export function StickerBadge({
  children,
  color = "coral",
  className,
  rotate = -6,
}: {
  children: ReactNode;
  color?: "coral" | "lavender" | "sage" | "honey" | "cocoa";
  className?: string;
  rotate?: number;
}) {
  const colors = {
    coral: "bg-coral text-white",
    lavender: "bg-lavender text-white",
    sage: "bg-sage text-white",
    honey: "bg-honey text-cocoa",
    cocoa: "bg-cocoa text-cream",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-cocoa font-bold text-xs shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]",
        colors[color],
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/**
 * ScratchDivider - Refined claw-mark divider
 */
export function ScratchDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4 my-8", className)}>
      <div className="flex-1 scratch-line max-w-[120px]" />
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-7 bg-coral rounded-full opacity-60"
            style={{ transform: `rotate(${(i - 1) * 12}deg)`, height: i === 1 ? "28px" : "22px" }}
          />
        ))}
      </div>
      <div className="flex-1 scratch-line max-w-[120px]" />
    </div>
  );
}

/**
 * MeowBubble - Chat bubble with expressive cat face
 */
interface MeowBubbleProps {
  children: ReactNode;
  variant?: "coral" | "lavender" | "sage" | "honey";
  author?: string;
  className?: string;
}

export function MeowBubble({ children, variant = "coral", author, className }: MeowBubbleProps) {
  const colors = {
    coral: "bg-coral-light border-coral",
    lavender: "bg-lavender-light border-lavender",
    sage: "bg-sage-light border-sage",
    honey: "bg-honey-light border-honey",
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative px-6 py-5 rounded-3xl border-2 font-medium text-sm", colors[variant])}>
        {/* Cat face avatar */}
        <div className="absolute -top-4 -left-3 w-11 h-11 rounded-2xl bg-cocoa border-2 border-cocoa flex items-center justify-center rotate-[-8deg] shadow-[2px_2px_0px_0px_rgba(255,107,107,1)]">
          <div className="relative w-6 h-5">
            {/* Ears */}
            <div className="absolute -top-1 left-0 w-2 h-2.5 bg-cocoa" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
            <div className="absolute -top-1 right-0 w-2 h-2.5 bg-cocoa" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
            {/* Eyes */}
            <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-coral rounded-full animate-blink" />
            <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-coral rounded-full animate-blink" />
            {/* Nose */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-coral rounded-full" />
          </div>
        </div>
        <div className="pl-5">{children}</div>
        {author && (
          <p className="pl-5 mt-2 text-xs font-bold text-cocoa/60">— {author}</p>
        )}
      </div>
    </div>
  );
}

/**
 * YarnSpinner - Animated yarn ball loader with trailing thread
 */
export function YarnSpinner({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="w-full h-full animate-spin" style={{ animationDuration: "1.8s" }}>
        <defs>
          <linearGradient id="yarn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#9B8CE0" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="19" fill="url(#yarn-grad)" stroke="#2A1D14" strokeWidth="2" />
        <path
          d="M10 22C16 16 26 26 38 22M12 14C18 22 28 12 36 18M10 30C16 36 26 26 38 32M14 10C20 18 30 8 34 16"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * PawRating - Paw print rating display
 */
export function PawRating({ value, max = 5, className, size = 18 }: { value: number; max?: number; className?: string; size?: number }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={cn("transition-all", i < value ? "fill-coral" : "fill-cocoa/10")}
        >
          <path d="M12 2C10.5 2 9.5 3.2 9.5 4.7C9.5 6.2 10.5 7.5 12 7.5C13.5 7.5 14.5 6.2 14.5 4.7C14.5 3.2 13.5 2 12 2ZM6.5 5C5.2 5 4 6.2 4 7.7C4 9.2 5.2 10.5 6.5 10.5C7.8 10.5 9 9.2 9 7.7C9 6.2 7.8 5 6.5 5ZM17.5 5C16.2 5 15 6.2 15 7.7C15 9.2 16.2 10.5 17.5 10.5C18.8 10.5 20 9.2 20 7.7C20 6.2 18.8 5 17.5 5ZM5.5 12.5C3.5 12.5 2 14.5 2 16.8C2 19.5 5.5 22 12 22C18.5 22 22 19.5 22 16.8C22 14.5 20.5 12.5 18.5 12.5C16.5 12.5 15.5 14 12 14C8.5 14 7.5 12.5 5.5 12.5Z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * WhiskerInput - Input with animated whiskers on focus
 */
interface WhiskerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function WhiskerInput({ icon, className, ...props }: WhiskerInputProps) {
  return (
    <div className="relative flex items-center group">
      <div className="absolute -left-4 flex flex-col gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none z-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3.5 h-0.5 bg-coral rounded-full origin-right" style={{ transform: `rotate(${(i - 1) * 22}deg)` }} />
        ))}
      </div>
      <div className="relative flex-1">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa/40">{icon}</div>}
        <input
          className={cn(
            "w-full px-5 py-3.5 rounded-2xl border-2 border-cocoa/15 bg-white text-cocoa placeholder:text-cocoa/40 font-medium focus:outline-none focus:border-coral focus:shadow-[3px_3px_0px_0px_rgba(255,107,107,1)] transition-all",
            icon && "pl-12",
            className
          )}
          {...props}
        />
      </div>
      <div className="absolute -right-4 flex flex-col gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none items-end z-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3.5 h-0.5 bg-coral rounded-full origin-left" style={{ transform: `rotate(${(i - 1) * -22}deg)` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * ProgressPaws - Progress bar with paw prints marking the trail
 */
export function ProgressPaws({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("relative h-4 bg-cream-dark rounded-full border-2 border-cocoa/15 overflow-hidden", className)}>
      <div
        className="absolute inset-y-0 left-0 bg-coral rounded-full transition-all duration-700 flex items-center justify-end pr-1"
        style={{ width: `${pct}%` }}
      >
        <span className="text-[10px]">🐾</span>
      </div>
    </div>
  );
}

/**
 * SectionTag - Small decorative section label with a line
 */
export function SectionTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="w-8 h-0.5 bg-coral rounded-full" />
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-coral">{children}</span>
      <span className="w-8 h-0.5 bg-coral rounded-full" />
    </div>
  );
}
