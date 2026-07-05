"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type CatType =
  | "sitting"
  | "sleeping"
  | "playing"
  | "walking"
  | "loaf"
  | "paw"
  | "yarn"
  | "fish"
  | "heart"
  | "pawtrail"
  | "whiskers"
  | "mouse"
  | "rat"
  | "goldfish"
  | "jumping"
  | "curious";

interface CatElement {
  id: number;
  type: CatType;
  x: number;
  y: number;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
  color: string;
  anim: "float" | "sway" | "wiggle" | "pounce";
}

export function CatBackground() {
  const [elements, setElements] = useState<CatElement[]>([]);

  useEffect(() => {
    const types: CatType[] = [
      "sitting", "sleeping", "playing", "walking", "loaf",
      "paw", "yarn", "fish", "heart", "pawtrail", "whiskers", "mouse",
      "rat", "goldfish", "jumping", "curious"
    ];
    const colors = ["#FF6B6B", "#9B8CE0", "#5FC79B", "#F5B942", "#FFB3AD", "#FF9E79", "#4ECDC4"];
    const anims: CatElement["anim"][] = ["float", "sway", "wiggle", "pounce"];

    const newElements: CatElement[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      x: Math.floor(Math.random() * 95) + 1,
      y: Math.floor(Math.random() * 95) + 1,
      size: Math.floor(Math.random() * 38) + 28,
      rotate: Math.floor(Math.random() * 60) - 30,
      duration: Math.floor(Math.random() * 7) + 8,
      delay: Math.random() * 6,
      color: colors[i % colors.length],
      anim: anims[i % anims.length],
    }));
    setElements(newElements);
  }, []);

  const renderIcon = (type: CatType, color: string) => {
    const op = "opacity-[0.32]";
    switch (type) {
      case "sitting":
        return (
          <svg viewBox="0 0 48 48" className={`w-full h-full ${op}`}>
            <path d="M14 42C14 30 18 24 24 24C30 24 34 30 34 42Z" fill={color} />
            <circle cx="24" cy="18" r="9" fill={color} />
            <path d="M15 12L13 4L21 9Z" fill={color} />
            <path d="M33 12L35 4L27 9Z" fill={color} />
            <path d="M34 40C40 40 42 34 40 30" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        );
      case "rat":
        return (
          <svg viewBox="0 0 48 48" className={`w-full h-full ${op}`}>
            <ellipse cx="28" cy="30" rx="14" ry="8" fill={color} />
            <circle cx="14" cy="24" r="6" fill={color} />
            <circle cx="12" cy="18" r="3" fill={color} />
            <circle cx="18" cy="18" r="3" fill={color} />
            <path d="M42 30C46 30 46 20 42 18" stroke={color} strokeWidth="2" fill="none" />
          </svg>
        );
      case "goldfish":
        return (
          <svg viewBox="0 0 48 48" className={`w-full h-full ${op}`}>
            <path d="M10 24C10 16 18 10 28 10C38 10 42 16 42 24C42 32 38 38 28 38C18 38 10 32 10 24Z" fill={color} />
            <path d="M10 24L2 14L2 34Z" fill={color} />
            <circle cx="34" cy="20" r="2" fill="white" />
          </svg>
        );
      case "mouse":
        return <span className={`text-4xl ${op} block select-none`}>🐭</span>;
      case "fish":
        return <span className={`text-4xl ${op} block select-none`}>🐟</span>;
      case "yarn":
        return <span className={`text-4xl ${op} block select-none`}>🧶</span>;
      case "heart":
        return <span className={`text-4xl ${op} block select-none`}>💖</span>;
      case "paw":
        return <span className={`text-4xl ${op} block select-none`}>🐾</span>;
      default:
        return (
          <svg viewBox="0 0 48 48" className={`w-full h-full ${op}`}>
            <circle cx="24" cy="24" r="16" fill={color} />
            <path d="M15 15L10 5L20 12" fill={color} />
            <path d="M33 15L38 5L28 12" fill={color} />
          </svg>
        );
    }
  };

  const getAnim = (anim: CatElement["anim"], duration: number, delay: number) => {
    const base = { duration, repeat: Infinity, ease: "easeInOut" as const, delay };
    switch (anim) {
      case "float":
        return { animate: { y: [-15, 15, -15], rotate: [-5, 5, -5] }, transition: base };
      case "sway":
        return { animate: { x: [-12, 12, -12], rotate: [-8, 8, -8] }, transition: base };
      case "wiggle":
        return { animate: { rotate: [-10, 10, -10], scale: [1, 1.1, 1] }, transition: { ...base, duration: duration * 0.7 } };
      case "pounce":
        return { animate: { y: [0, -20, 0], scale: [1, 1.2, 0.9, 1] }, transition: { ...base, duration: duration * 0.5 } };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none blur-[2px] opacity-70">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-dark/30 to-cream" />
      <div className="absolute inset-0 dot-pattern opacity-10" />
      
      {elements.map((el) => {
        const { animate, transition } = getAnim(el.anim, el.duration, el.delay);
        return (
          <motion.div
            key={el.id}
            className="absolute flex items-center justify-center"
            style={{ left: `${el.x}%`, top: `${el.y}%`, width: el.size, height: el.size }}
            initial={{ rotate: el.rotate, y: 0 }}
            animate={animate}
            transition={transition}
          >
            {renderIcon(el.type, el.color)}
          </motion.div>
        );
      })}
    </div>
  );
}
