"use client";

import { useEffect, useState } from "react";

export default function PixelCatDecoration() {
  const [tailFrame, setTailFrame] = useState(0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const tailInterval = setInterval(() => {
      setTailFrame((f) => (f + 1) % 2);
    }, 1200);
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => {
      clearInterval(tailInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  const tailCurve = tailFrame === 0 ? "Q 48 18, 52 10" : "Q 50 16, 54 12";
  const eyeH = blink ? 0.5 : 3.5;

  return (
    <div className="absolute -right-8 bottom-0">
      <svg width="60" height="50" viewBox="0 0 60 50" style={{ overflow: "visible" }}>
        {/* Tail */}
        <path
          d={`M 42 32 ${tailCurve}`}
          stroke="#1A1A1A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body - round sitting */}
        <ellipse cx="30" cy="35" rx="13" ry="11" fill="#1A1A1A" />

        {/* Belly */}
        <ellipse cx="28" cy="37" rx="7" ry="6" fill="#333" opacity="0.35" />

        {/* Head - big round */}
        <circle cx="26" cy="18" r="11" fill="#1A1A1A" />

        {/* Ears */}
        <polygon points="17,10 14,0 22,7" fill="#1A1A1A" />
        <polygon points="32,7 37,0 37,10" fill="#1A1A1A" />
        {/* Inner ears - pink */}
        <polygon points="18,9.5 15.5,2 21,7.5" fill="#FF8A80" opacity="0.6" />
        <polygon points="32.5,7.5 36,2 36,9.5" fill="#FF8A80" opacity="0.6" />

        {/* Eyes - big sparkly */}
        <ellipse cx="21" cy="16" rx="3" ry={eyeH} fill="white" />
        <ellipse cx="31" cy="16" rx="3" ry={eyeH} fill="white" />
        {!blink && (
          <>
            <ellipse cx="21.5" cy="16.5" rx="2" ry="2.5" fill="#FFC107" />
            <ellipse cx="31.5" cy="16.5" rx="2" ry="2.5" fill="#FFC107" />
            <ellipse cx="22" cy="16.5" rx="1.2" ry="2" fill="#1A1A1A" />
            <ellipse cx="32" cy="16.5" rx="1.2" ry="2" fill="#1A1A1A" />
            <circle cx="20" cy="15" r="0.8" fill="white" />
            <circle cx="30" cy="15" r="0.8" fill="white" />
          </>
        )}

        {/* Nose */}
        <polygon points="25,20 27,20 26,21.5" fill="#FF8A80" />

        {/* Mouth */}
        <path d="M 23 22 Q 24.5 23.5 26 22 Q 27.5 23.5 29 22" stroke="#FF8A80" strokeWidth="0.6" fill="none" />

        {/* Cheek blush */}
        <circle cx="17" cy="20" r="2" fill="#FF8A80" opacity="0.2" />
        <circle cx="35" cy="20" r="2" fill="#FF8A80" opacity="0.2" />

        {/* Whiskers */}
        <line x1="12" y1="18" x2="19" y2="19" stroke="#555" strokeWidth="0.4" />
        <line x1="12" y1="21" x2="19" y2="21" stroke="#555" strokeWidth="0.4" />
        <line x1="33" y1="19" x2="40" y2="18" stroke="#555" strokeWidth="0.4" />
        <line x1="33" y1="21" x2="40" y2="21" stroke="#555" strokeWidth="0.4" />

        {/* Front paws */}
        <ellipse cx="22" cy="45" rx="3.5" ry="2.5" fill="#1A1A1A" />
        <ellipse cx="34" cy="45" rx="3.5" ry="2.5" fill="#1A1A1A" />
      </svg>
    </div>
  );
}
