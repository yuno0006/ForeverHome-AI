// Lottie-animated cat sprite for Whisker Runner.
//
// Uses the Lottie cat animation from lottie.host for a smooth,
// animated cat character instead of pixel-art.
//
// Requirement 5.5.9: Animated Nyan Cat sprite with running, jumping poses.

"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export type CatPose = "standing" | "jumping";

interface LottieCatSpriteProps {
  pose: CatPose;
  /** Rendered width/height in px (sprite is always square). Defaults to 48. */
  size?: number;
  className?: string;
}

// Lottie animation URL
const CAT_ANIMATION_URL = "https://lottie.host/0ded852d-af58-40ba-89cc-680812460040/KTgdwrRImj.lottie";

/**
 * Renders the animated cat character using Lottie.
 * The animation plays continuously for both standing and jumping poses.
 */
export function LottieCatSprite({ pose, size = 48, className }: LottieCatSpriteProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Fetch the Lottie animation data
    fetch(CAT_ANIMATION_URL)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Failed to load Lottie animation:", err));
  }, []);

  if (!animationData) {
    // Fallback to a simple placeholder while loading
    return (
      <div 
        className={className}
        style={{ 
          width: size, 
          height: size,
          background: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)",
          borderRadius: "8px"
        }}
      />
    );
  }

  return (
    <div 
      className={className}
      style={{ 
        width: size, 
        height: size,
        transform: pose === "jumping" ? "rotate(-10deg)" : "rotate(0deg)",
        transition: "transform 0.1s ease-out"
      }}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
