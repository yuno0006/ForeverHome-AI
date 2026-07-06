"use client";

// Clean obstacle sprites for the Whisker Runner mini-game.
// Realistic-ish household items and themed season obstacles rendered as inline SVGs.
// Auto-scale cleanly at any size. No pixel-art grid, no emoji fallbacks.

import type { ObstacleType } from "@/types/whiskerRunner";

interface ObstacleSpriteProps {
  type: ObstacleType;
  /** Selects a concrete design within `type`. */
  variant?: number;
  /** Rendered height in px; width is auto from the viewBox. */
  size?: number;
  className?: string;
}

// ─── Cardboard Box ──────────────────────────────────────────────
function CardboardBoxSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cardboard box">
      {/* Box body */}
      <rect x="6" y="24" width="36" height="26" fill="#C59B6D" rx="2" />
      {/* Open flaps */}
      <polygon points="6,24 2,12 20,16 6,24" fill="#A87C4F" />
      <polygon points="42,24 46,12 28,16 42,24" fill="#A87C4F" />
      {/* Inside shadow */}
      <rect x="8" y="24" width="32" height="4" fill="#784E26" />
      {/* Tape */}
      <rect x="22" y="28" width="4" height="22" fill="#D2B48C" opacity="0.7" />
      {/* Cute paw stamp */}
      <circle cx="24" cy="40" r="3" fill="#8E653C" />
      <circle cx="20" cy="35" r="1.5" fill="#8E653C" />
      <circle cx="24" cy="33" r="1.5" fill="#8E653C" />
      <circle cx="28" cy="35" r="1.5" fill="#8E653C" />
    </svg>
  );
}

// ─── Yarn Ball ──────────────────────────────────────────────────
function YarnBallSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="yarn ball">
      <circle cx="24" cy="34" r="16" fill="#FF8A80" />
      {/* Thread loops */}
      <path d="M12,24 Q24,18 36,24" stroke="#FF5252" strokeWidth="2.5" fill="none" />
      <path d="M8,34 Q24,28 40,34" stroke="#FF5252" strokeWidth="2.5" fill="none" />
      <path d="M12,44 Q24,50 36,44" stroke="#FF5252" strokeWidth="2.5" fill="none" />
      <path d="M16,20 Q16,34 32,48" stroke="#FF5252" strokeWidth="2.5" fill="none" />
      <path d="M32,20 Q32,34 16,48" stroke="#FF5252" strokeWidth="2.5" fill="none" />
      {/* Loose thread on ground */}
      <path d="M34,46 Q42,50 30,54 T10,53" stroke="#FF8A80" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Laundry basket ───────────────────────────────────────────────
function LaundryBasketSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="laundry basket">
      {/* basket body — woven trapezoid */}
      <path d="M6 20 L12 52 L36 52 L42 20 Z" fill="#D4A574" />
      {/* weave lines */}
      <line x1="8" y1="28" x2="40" y2="28" stroke="#B8860B" strokeWidth="1.5" />
      <line x1="7" y1="36" x2="41" y2="36" stroke="#B8860B" strokeWidth="1.5" />
      <line x1="9" y1="44" x2="39" y2="44" stroke="#B8860B" strokeWidth="1.5" />
      <line x1="24" y1="20" x2="24" y2="52" stroke="#B8860B" strokeWidth="1.5" />
      <line x1="16" y1="20" x2="13" y2="52" stroke="#B8860B" strokeWidth="1.5" />
      <line x1="32" y1="20" x2="35" y2="52" stroke="#B8860B" strokeWidth="1.5" />
      {/* rim */}
      <rect x="4" y="16" width="40" height="6" rx="3" fill="#8B6914" />
      {/* clothes peeking out */}
      <ellipse cx="14" cy="16" rx="5" ry="6" fill="#5DADE2" />
      <ellipse cx="26" cy="15" rx="6" ry="7" fill="#AF7AC5" />
      <ellipse cx="36" cy="16" rx="4" ry="5" fill="#F1948A" />
    </svg>
  );
}

// ─── Broom ────────────────────────────────────────────────────────
function BroomSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="broom">
      {/* handle */}
      <rect x="22" y="4" width="4" height="32" rx="2" fill="#8B6914" />
      {/* bristle head */}
      <path d="M6 42 Q4 56 24 56 Q44 56 42 42 Z" fill="#F4D03F" />
      {/* bristle lines */}
      <line x1="10" y1="44" x2="6" y2="54" stroke="#D4AC0D" strokeWidth="1.2" />
      <line x1="16" y1="44" x2="13" y2="56" stroke="#D4AC0D" strokeWidth="1.2" />
      <line x1="24" y1="44" x2="24" y2="56" stroke="#D4AC0D" strokeWidth="1.2" />
      <line x1="32" y1="44" x2="35" y2="56" stroke="#D4AC0D" strokeWidth="1.2" />
      <line x1="38" y1="44" x2="42" y2="54" stroke="#D4AC0D" strokeWidth="1.2" />
      {/* binding at top of bristles */}
      <rect x="5" y="38" width="38" height="4" rx="2" fill="#566573" />
    </svg>
  );
}

// ─── Hanging string toy ──────────────────────────────────────────
function HangingStringToySvg() {
  return (
    <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="hanging string toy">
      {/* string */}
      <line x1="18" y1="0" x2="18" y2="22" stroke="#7F8C8D" strokeWidth="2" />
      {/* toy ball */}
      <circle cx="18" cy="32" r="12" fill="#E74C3C" />
      <circle cx="18" cy="32" r="8" fill="#C0392B" />
      {/* ball detail lines */}
      <path d="M18 22 Q28 26 18 30" stroke="#F1948A" strokeWidth="1.5" fill="none" />
      <path d="M18 34 Q8 38 18 42" stroke="#F1948A" strokeWidth="1.5" fill="none" />
      {/* bell at bottom */}
      <circle cx="18" cy="42" r="3" fill="#F1C40F" />
    </svg>
  );
}

// ─── Bird toy ─────────────────────────────────────────────────────
function BirdToySvg() {
  return (
    <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="bird toy">
      {/* string */}
      <line x1="18" y1="0" x2="18" y2="18" stroke="#7F8C8D" strokeWidth="2" />
      {/* bird body */}
      <ellipse cx="18" cy="28" rx="12" ry="8" fill="#3498DB" />
      {/* wing */}
      <ellipse cx="22" cy="26" rx="7" ry="5" fill="#2980B9" />
      {/* eye */}
      <circle cx="13" cy="26" r="2.5" fill="white" />
      <circle cx="12.5" cy="26" r="1.2" fill="#2C3E50" />
      {/* beak */}
      <polygon points="6,27 2,28 6,29" fill="#F39C12" />
      {/* tail */}
      <polygon points="30,28 36,24 36,30" fill="#2980B9" />
    </svg>
  );
}

// ─── Flying Bird (Morning Obstacle) ──────────────────────────────
function FlyingBirdSvg() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flying bird">
      <style>{`
        @keyframes wing-flap {
          0% { transform: rotate(15deg); }
          100% { transform: rotate(-35deg); }
        }
      `}</style>
      {/* Tail */}
      <path d="M12 26 L4 20 L6 30 Z" fill="#0288D1" />
      {/* Body */}
      <path d="M12 26 C12 18, 20 14, 28 14 C36 14, 40 20, 40 26 C40 32, 36 38, 28 38 C20 38, 12 32, 12 26 Z" fill="#4FC3F7" />
      {/* Beak */}
      <polygon points="40,24 46,26 40,28" fill="#FFB74D" />
      {/* Eye */}
      <circle cx="34" cy="22" r="2.5" fill="white" />
      <circle cx="34.5" cy="22" r="1.2" fill="#263238" />
      {/* Wing (animated/flapping) */}
      <path
        d="M24 24 C24 12, 32 8, 28 24 C24 40, 20 32, 24 24 Z"
        fill="#0288D1"
        style={{
          transformOrigin: "24px 24px",
          animation: "wing-flap 0.15s ease-in-out infinite alternate",
        }}
      />
    </svg>
  );
}

// ─── Sleeping Kitten in Bed (Evening Obstacle) ───────────────────
function SleepingKittenSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sleeping kitty in bed">
      {/* Cozy circular bed */}
      <ellipse cx="24" cy="38" rx="18" ry="10" fill="#FFB74D" />
      <ellipse cx="24" cy="38" rx="14" ry="7" fill="#FFA726" />
      {/* Cushion */}
      <ellipse cx="24" cy="37" rx="12" ry="5" fill="#FFE082" />
      {/* Curled white kitten body */}
      <circle cx="21" cy="36" r="6" fill="#ECEFF1" />
      {/* Kitten head */}
      <circle cx="26" cy="34" r="4.5" fill="#ECEFF1" />
      {/* Ears */}
      <path d="M26,34 L28,30 L29,33 Z" fill="#ECEFF1" />
      <path d="M24,34 L25,30 L26,33 Z" fill="#ECEFF1" />
      {/* Tail */}
      <path d="M16,38 Q18,41 21,39" stroke="#ECEFF1" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Closed eye */}
      <path d="M25,35 Q26,36 27,35" stroke="#78909C" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Snowman (Winter Obstacle) ───────────────────────────────────
function SnowmanSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="snowman">
      {/* Bottom ball */}
      <circle cx="24" cy="40" r="12" fill="#ECEFF1" />
      {/* Top ball */}
      <circle cx="24" cy="22" r="8" fill="#ECEFF1" />
      {/* Coal eyes */}
      <circle cx="21" cy="20" r="1" fill="#37474F" />
      <circle cx="27" cy="20" r="1" fill="#37474F" />
      {/* Carrot nose */}
      <polygon points="24,22 32,23 24,25" fill="#FF9800" />
      {/* Scarf */}
      <path d="M16,28 Q24,31 32,28 L30,36 Z" fill="#E53935" />
      {/* Coal buttons */}
      <circle cx="24" cy="35" r="1.2" fill="#37474F" />
      <circle cx="24" cy="41" r="1.2" fill="#37474F" />
      {/* Stick arms */}
      <path d="M12,30 L4,26" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M36,30 L44,26" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Rainboot (Rainy Obstacle) ───────────────────────────────────
function RainbootSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="rainboot">
      {/* Boot body */}
      <path d="M16,12 L28,12 L28,38 L38,42 C38,46 36,48 30,48 L14,48 C10,48 10,42 10,38 L16,12 Z" fill="#FFEB3B" />
      {/* Sole */}
      <path d="M10,46 L38,46 L38,49 C38,51 36,51 30,51 L14,51 C10,51 10,49 10,46 Z" fill="#F57F17" />
      {/* Rim highlight */}
      <rect x="15" y="10" width="14" height="3" rx="1.5" fill="#F57F17" />
      {/* Cute cloud print on boot */}
      <ellipse cx="21" cy="30" rx="4" ry="3" fill="white" />
      <ellipse cx="25" cy="29" rx="3.5" ry="2.8" fill="white" />
      <ellipse cx="18" cy="31" rx="3" ry="2.5" fill="white" />
    </svg>
  );
}

// ─── Jack-O-Lantern (Spooky Obstacle) ────────────────────────────
function JackOLanternSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="jack-o-lantern">
      {/* Stem */}
      <rect x="22" y="6" width="4" height="10" rx="2" fill="#4CAF50" />
      {/* Pumpkin body */}
      <ellipse cx="24" cy="34" r="18" fill="#FF9800" />
      <ellipse cx="24" cy="34" rx="12" ry="18" fill="#F57C00" />
      <ellipse cx="24" cy="34" rx="6" ry="18" fill="#E65100" />
      {/* Spooky eyes */}
      <polygon points="16,26 22,26 19,31" fill="#FFE082" />
      <polygon points="32,26 26,26 29,31" fill="#FFE082" />
      {/* Nose */}
      <polygon points="24,31 22,34 26,34" fill="#FFE082" />
      {/* Jagged Smile */}
      <path d="M14,38 Q24,46 34,38 C31,42 27,42 24,39 C21,42 17,42 14,38 Z" fill="#FFE082" />
    </svg>
  );
}

// ─── Meteor (Cosmic Obstacle) ────────────────────────────────────
function MeteorSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cosmic meteor">
      {/* Fire trail */}
      <path d="M24,6 L10,32 L24,24 L38,32 Z" fill="url(#fireGrad)" />
      <defs>
        <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E040FB" />
          <stop offset="100%" stopColor="#FF4081" />
        </linearGradient>
      </defs>
      {/* Glowing orange meteor body (no black!) */}
      <circle cx="24" cy="34" r="12" fill="#FF6D00" />
      {/* Glowing yellow craters */}
      <circle cx="18" cy="30" r="2.5" fill="#FFD54F" opacity="0.85" />
      <circle cx="28" cy="38" r="3" fill="#FFD54F" opacity="0.85" />
      <circle cx="24" cy="28" r="1.5" fill="#FFD54F" opacity="0.85" />
    </svg>
  );
}

// ─── Sakura Pile ────────────────────────────────────────────────
function SakuraPileSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sakura pile">
      {/* Bottom layer */}
      <ellipse cx="24" cy="46" rx="18" ry="8" fill="#FF8DA1" opacity="0.95" />
      <ellipse cx="20" cy="44" rx="14" ry="7" fill="#FFB3C1" />
      <ellipse cx="28" cy="45" rx="14" ry="7" fill="#FF6CA7" />
      
      {/* Middle layer */}
      <ellipse cx="24" cy="36" rx="12" ry="6" fill="#FFE3E8" />
      <ellipse cx="21" cy="35" rx="9" ry="5" fill="#FF8DA1" />
      <ellipse cx="27" cy="35" rx="9" ry="5" fill="#FF6CA7" />
      
      {/* Top layer/peak */}
      <ellipse cx="24" cy="26" rx="7" ry="4" fill="#FFE3E8" />
      <path d="M24 16 L27 24 L21 24 Z" fill="#FFB3C1" />
      <path d="M22 22 L25 18 L24 25 Z" fill="#FF6CA7" />
      
      {/* Fallen side petals */}
      <path d="M8 46 C6 44, 10 42, 12 45 Z" fill="#FF8DA1" />
      <path d="M38 47 C40 45, 36 43, 35 46 Z" fill="#FF6CA7" />
    </svg>
  );
}

// ─── Flower Pot ─────────────────────────────────────────────────
function FlowerPotSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flower pot">
      {/* Terracotta pot */}
      <path d="M12 32 L14 48 C14 50 16 50 18 50 L30 50 C32 50 34 50 36 48 L38 32 Z" fill="#D35400" />
      <rect x="10" y="28" width="28" height="5" rx="2" fill="#E67E22" />
      
      {/* THICK, highly visible flower stem */}
      <rect x="21" y="14" width="6" height="15" fill="#27AE60" rx="1.5" />
      
      {/* Large leaves */}
      <path d="M21 24 C14 20, 15 28, 21 27 Z" fill="#2ECC71" />
      <path d="M27 22 C34 18, 33 26, 27 25 Z" fill="#2ECC71" />
      
      {/* A big, gorgeous, highly visible tulip flower on top */}
      <path d="M16 14 C16 4, 32 4, 32 14 L16 14 Z" fill="#E91E63" />
      {/* Center petal */}
      <path d="M21 14 L24 6 L27 14 Z" fill="#FF1744" />
      {/* Yellow center core */}
      <circle cx="24" cy="13" r="2.5" fill="#FFEB3B" />
    </svg>
  );
}

// ─── Butterflies ───────────────────────────────────────────────
function ButterfliesSvg() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="butterflies">
      <style>{`
        @keyframes wing-flap-butterfly {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.25); }
        }
      `}</style>
      {/* Body */}
      <rect x="23" y="10" width="2" height="28" rx="1" fill="#37474F" />
      <circle cx="24" cy="8" r="2.5" fill="#37474F" />
      {/* Antennas */}
      <path d="M22,6 Q18,2 20,0" stroke="#37474F" strokeWidth="1" fill="none" />
      <path d="M26,6 Q30,2 28,0" stroke="#37474F" strokeWidth="1" fill="none" />
      
      {/* Left Wings */}
      <g style={{ transformOrigin: "24px 24px", animation: "wing-flap-butterfly 0.2s ease-in-out infinite alternate" }}>
        <path d="M23 20 C14 10, 8 20, 23 26 Z" fill="#FF4081" />
        <path d="M23 26 C12 28, 14 36, 23 34 Z" fill="#BB86FC" />
      </g>
      {/* Right Wings */}
      <g style={{ transformOrigin: "24px 24px", animation: "wing-flap-butterfly 0.2s ease-in-out infinite alternate-reverse" }}>
        <path d="M25 20 C34 10, 40 20, 25 26 Z" fill="#FF4081" />
        <path d="M25 26 C36 28, 34 36, 25 34 Z" fill="#BB86FC" />
      </g>
    </svg>
  );
}

// ─── Beach Ball ─────────────────────────────────────────────────
function BeachBallSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="beach ball">
      <circle cx="24" cy="34" r="16" fill="#2196F3" />
      <path d="M24 18 C18 24 18 44 24 50 Z" fill="#FFEB3B" />
      <path d="M24 18 C30 24 30 44 24 50 Z" fill="#F44336" />
      <circle cx="24" cy="34" r="3.5" fill="white" />
    </svg>
  );
}

// ─── Crab ───────────────────────────────────────────────────────
function CrabSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="crab">
      <ellipse cx="24" cy="38" rx="14" ry="10" fill="#E53935" />
      <circle cx="18" cy="26" r="3" fill="white" />
      <circle cx="18" cy="26" r="1.2" fill="black" />
      <circle cx="30" cy="26" r="3" fill="white" />
      <circle cx="30" cy="26" r="1.2" fill="black" />
      <line x1="18" y1="30" x2="18" y2="27" stroke="#E53935" strokeWidth="2" />
      <line x1="30" y1="30" x2="30" y2="27" stroke="#E53935" strokeWidth="2" />
      <path d="M10,26 C6,26 6,32 10,32 Z" fill="#E53935" />
      <path d="M38,26 C42,26 42,32 38,32 Z" fill="#E53935" />
      <path d="M10,42 L4,44 M38,42 L44,44 M12,46 L6,50 M36,46 L42,50" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Sandcastle ─────────────────────────────────────────────────
function SandcastleSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sandcastle">
      <path d="M6 46 L42 46 L38 52 L10 52 Z" fill="#D2B48C" />
      <rect x="18" y="24" width="12" height="22" fill="#E6C280" />
      <polygon points="16,24 24,14 32,24" fill="#C5A059" />
      <rect x="10" y="30" width="8" height="16" fill="#D2B48C" />
      <polygon points="8,30 14,22 20,30" fill="#B59049" />
      <rect x="30" y="30" width="8" height="16" fill="#D2B48C" />
      <polygon points="28,30 34,22 40,30" fill="#B59049" />
      <path d="M21 46 C21 40, 27 40, 27 46 Z" fill="#7E5835" />
    </svg>
  );
}

// ─── Seashell ───────────────────────────────────────────────────
function ShellSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="seashell">
      <path d="M14 42 C12 36, 12 24, 24 24 C36 24, 36 36, 34 42 Z" fill="#F8BBD0" />
      <ellipse cx="24" cy="42" rx="12" ry="4" fill="#F48FB1" />
      <path d="M24 24 L24 38" stroke="#F06292" strokeWidth="1.5" />
      <path d="M24 24 L19 36" stroke="#F06292" strokeWidth="1.5" />
      <path d="M24 24 L29 36" stroke="#F06292" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Acorn ──────────────────────────────────────────────────────
function AcornSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="acorn">
      <path d="M10 24 Q24 16 38 24 L38 28 L10 28 Z" fill="#5D4037" />
      <rect x="22" y="10" width="4" height="8" rx="2" fill="#5D4037" />
      <path d="M12 28 C12 38 20 48 24 50 C28 48 36 38 36 28 Z" fill="#8D6E63" />
    </svg>
  );
}

// ─── Pumpkin ────────────────────────────────────────────────────
function PumpkinSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="pumpkin">
      <rect x="22" y="8" width="4" height="8" rx="2" fill="#4CAF50" />
      <ellipse cx="24" cy="34" r="16" fill="#FF9800" />
      <ellipse cx="24" cy="34" rx="10" ry="16" fill="#F57C00" />
    </svg>
  );
}

// ─── Ice Block ──────────────────────────────────────────────────
function IceBlockSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ice block">
      <rect x="10" y="22" width="28" height="28" rx="4" fill="#80DEEA" />
      <path d="M14 26 L22 26 L16 46 L14 46 Z" fill="white" opacity="0.4" />
      <path d="M30 26 L34 26 L26 46 L22 46 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

// ─── Holly Bush ─────────────────────────────────────────────────
function HollyBushSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="holly bush">
      <circle cx="18" cy="38" r="10" fill="#2E7D32" />
      <circle cx="30" cy="38" r="10" fill="#2E7D32" />
      <circle cx="24" cy="30" r="9" fill="#1B5E20" />
      <path d="M15,26 Q24,20 33,26 Q24,28 15,26 Z" fill="#ECEFF1" />
      <circle cx="21" cy="34" r="3" fill="#E53935" />
      <circle cx="27" cy="35" r="3" fill="#E53935" />
      <circle cx="24" cy="38" r="2.5" fill="#C62828" />
    </svg>
  );
}

// ─── Umbrella ───────────────────────────────────────────────────
function UmbrellaSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="umbrella">
      <path d="M22 36 L22 50 C22 52 25 52 26 50" stroke="#795548" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M8 32 C8 16, 40 16, 40 32 C34 28, 28 28, 24 32 C20 28, 14 28, 8 32 Z" fill="#42A5F5" />
      <path d="M16 22 Q24 16 32 22" stroke="#FFF" strokeWidth="1.5" fill="none" />
      <rect x="23" y="12" width="2" height="4" fill="#795548" />
    </svg>
  );
}

// ─── Spilled Puddle ──────────────────────────────────────────────
function PuddleSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="puddle">
      <ellipse cx="24" cy="46" rx="18" ry="6" fill="#29B6F6" opacity="0.7" />
      <ellipse cx="22" cy="45" rx="12" ry="4" fill="#81D4FA" opacity="0.8" />
      <circle cx="12" cy="40" r="1.5" fill="#29B6F6" />
      <circle cx="36" cy="38" r="2.0" fill="#29B6F6" />
    </svg>
  );
}

// ─── Cauldron ───────────────────────────────────────────────────
function CauldronSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cauldron">
      {/* Bubblegum purple legs */}
      <rect x="12" y="44" width="4" height="8" rx="2" fill="#E040FB" />
      <rect x="32" y="44" width="4" height="8" rx="2" fill="#E040FB" />
      {/* Neon Purple cauldron body (no black!) */}
      <circle cx="24" cy="32" r="16" fill="#9C27B0" />
      <rect x="12" y="18" width="24" height="4" rx="2" fill="#7B1FA2" />
      {/* Bubbling green potion */}
      <path d="M14 18 Q24 14 34 18 Z" fill="#00E676" />
      <circle cx="20" cy="14" r="1.5" fill="#00E676" />
      <circle cx="26" cy="11" r="1" fill="#00E676" />
      <circle cx="30" cy="15" r="2" fill="#00E676" />
    </svg>
  );
}

// ─── Ghost ──────────────────────────────────────────────────────
function GhostSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ghost">
      <path d="M12 24 C12 14, 36 14, 36 24 L36 46 L32 42 L28 46 L24 42 L20 46 L16 42 L12 46 Z" fill="#ECEFF1" opacity="0.85" />
      <circle cx="20" cy="24" r="1.8" fill="#263238" />
      <circle cx="28" cy="24" r="1.8" fill="#263238" />
      <ellipse cx="24" cy="29" rx="1.2" ry="2.2" fill="#263238" />
    </svg>
  );
}

// ─── Space Helmet ───────────────────────────────────────────────
function SpaceHelmetSvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="space helmet">
      <rect x="12" y="44" width="24" height="6" rx="3" fill="#B0BEC5" />
      <rect x="16" y="46" width="16" height="2" fill="#E0E0E0" />
      <circle cx="24" cy="30" r="15" fill="#E0F7FA" stroke="#B0BEC5" strokeWidth="2" opacity="0.75" />
      <path d="M14 24 A 12 12 0 0 1 24 16 L24 18 A 10 10 0 0 0 16 25 Z" fill="white" opacity="0.4" />
    </svg>
  );
}

// ─── Star Trophy ────────────────────────────────────────────────
function StarTrophySvg() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cosmic star">
      <path d="M16 46 L32 46 L28 52 L20 52 Z" fill="#CFD8DC" />
      <polygon points="24,10 28,20 38,20 30,26 33,36 24,30 15,36 18,26 10,20 20,20" fill="#FFD54F" stroke="#FFA000" strokeWidth="1.5" />
      <circle cx="21" cy="22" r="1" fill="#5D4037" />
      <circle cx="27" cy="22" r="1" fill="#5D4037" />
      <path d="M23,25 Q24,26 25,25" stroke="#5D4037" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function getComponent(type: ObstacleType, variant: number, seasonIndex: number) {
  if (type === "ground") {
    switch (seasonIndex) {
      case 0: // Summer (Beach)
        const summerList = [SandcastleSvg, BeachBallSvg, CrabSvg, ShellSvg];
        return summerList[((variant % summerList.length) + summerList.length) % summerList.length];
      case 1: // Spooky
        const spookyList = [CardboardBoxSvg, JackOLanternSvg, CauldronSvg, GhostSvg];
        return spookyList[((variant % spookyList.length) + spookyList.length) % spookyList.length];
      case 2: // Spring
        const springList = [CardboardBoxSvg, YarnBallSvg, FlowerPotSvg, SakuraPileSvg];
        return springList[((variant % springList.length) + springList.length) % springList.length];
      case 3: // Cosmic
        const cosmicList = [CardboardBoxSvg, MeteorSvg, SpaceHelmetSvg, StarTrophySvg];
        return cosmicList[((variant % cosmicList.length) + cosmicList.length) % cosmicList.length];
      case 4: // Autumn
        const autumnList = [CardboardBoxSvg, SleepingKittenSvg, AcornSvg, PumpkinSvg];
        return autumnList[((variant % autumnList.length) + autumnList.length) % autumnList.length];
      case 5: // Rainy
        const rainyList = [CardboardBoxSvg, RainbootSvg, UmbrellaSvg, PuddleSvg];
        return rainyList[((variant % rainyList.length) + rainyList.length) % rainyList.length];
      case 6: // Winter
        const winterList = [CardboardBoxSvg, SnowmanSvg, IceBlockSvg, HollyBushSvg];
        return winterList[((variant % winterList.length) + winterList.length) % winterList.length];
      default:
        return CardboardBoxSvg;
    }
  }
  const air = [HangingStringToySvg, BirdToySvg];
  return air[((variant % air.length) + air.length) % air.length];
}

interface ExtendedObstacleSpriteProps extends ObstacleSpriteProps {
  seasonIndex?: number;
}

export function ObstacleSprite({ type, variant = 0, size = 48, className, seasonIndex = 0 }: ExtendedObstacleSpriteProps) {
  const Comp = getComponent(type, variant, seasonIndex);

  const isFlying = Comp === FlyingBirdSvg || Comp === MeteorSvg;

  if (isFlying && type === "ground") {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transform: "translateY(-14px)", // hover 14px off the ground
          filter: "drop-shadow(2px 2px 0px #2A201D)",
        }}
      >
        <Comp />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        filter: "drop-shadow(2px 2px 0px #2A201D)",
      }}
    >
      <Comp />
    </div>
  );
}

export default ObstacleSprite;
