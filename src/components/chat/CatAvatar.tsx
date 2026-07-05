"use client";

/**
 * A cute cartoon cat avatar for the AI assistant.
 * Used in all chat interfaces (General Assistant, 14-Day Coach).
 */
export function CatAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100 border-2 border-orange-200 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size * 0.82}
        height={size * 0.82}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left ear */}
        <path d="M12 20 L8 8 L22 16 Z" fill="#F59E0B" />
        <path d="M13 19 L10 12 L18 17 Z" fill="#FCD34D" />
        {/* Right ear */}
        <path d="M52 20 L56 8 L42 16 Z" fill="#F59E0B" />
        <path d="M51 19 L54 12 L46 17 Z" fill="#FCD34D" />
        {/* Head */}
        <ellipse cx="32" cy="34" rx="21" ry="18" fill="#FBBF24" />
        <ellipse cx="32" cy="36" rx="19" ry="16" fill="#FDE68A" />
        {/* Eyes */}
        <ellipse cx="24" cy="31" rx="5" ry="5.5" fill="white" />
        <ellipse cx="40" cy="31" rx="5" ry="5.5" fill="white" />
        <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#1E293B" />
        <ellipse cx="41" cy="31" rx="3" ry="3.5" fill="#1E293B" />
        {/* Eye shine */}
        <circle cx="26.5" cy="29.5" r="1.2" fill="white" />
        <circle cx="42.5" cy="29.5" r="1.2" fill="white" />
        {/* Nose */}
        <path d="M30 36 L32 39 L34 36 Z" fill="#F472B6" />
        {/* Mouth */}
        <path d="M28 38 Q32 43 36 38" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M32 39 L32 40.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="10" y1="34" x2="22" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="9" y1="38" x2="21" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="10" y1="42" x2="22" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="54" y1="34" x2="42" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="55" y1="38" x2="43" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="54" y1="42" x2="42" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
        {/* Blush */}
        <ellipse cx="18" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
        <ellipse cx="46" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
      </svg>
    </div>
  );
}

/**
 * The AI cat avatar as a standalone icon — no background circle.
 */
export function CatIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left ear */}
      <path d="M12 20 L8 8 L22 16 Z" fill="#F59E0B" />
      <path d="M13 19 L10 12 L18 17 Z" fill="#FCD34D" />
      {/* Right ear */}
      <path d="M52 20 L56 8 L42 16 Z" fill="#F59E0B" />
      <path d="M51 19 L54 12 L46 17 Z" fill="#FCD34D" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="21" ry="18" fill="#FBBF24" />
      <ellipse cx="32" cy="36" rx="19" ry="16" fill="#FDE68A" />
      {/* Eyes */}
      <ellipse cx="24" cy="31" rx="5" ry="5.5" fill="white" />
      <ellipse cx="40" cy="31" rx="5" ry="5.5" fill="white" />
      <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#1E293B" />
      <ellipse cx="41" cy="31" rx="3" ry="3.5" fill="#1E293B" />
      {/* Eye shine */}
      <circle cx="26.5" cy="29.5" r="1.2" fill="white" />
      <circle cx="42.5" cy="29.5" r="1.2" fill="white" />
      {/* Nose */}
      <path d="M30 36 L32 39 L34 36 Z" fill="#F472B6" />
      {/* Mouth */}
      <path d="M28 38 Q32 43 36 38" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M32 39 L32 40.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="10" y1="34" x2="22" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="9" y1="38" x2="21" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="10" y1="42" x2="22" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="54" y1="34" x2="42" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="55" y1="38" x2="43" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="54" y1="42" x2="42" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="18" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
      <ellipse cx="46" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
    </svg>
  );
}
