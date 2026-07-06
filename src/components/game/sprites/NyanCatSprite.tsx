"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export type CatPose = "standing" | "jumping";

interface NyanCatSpriteProps {
  pose: CatPose;
  className?: string;
}

const CAT_ANIMATION_PATH = "/cat-run-animation.json";

export function NyanCatSprite({ pose: _pose, className }: NyanCatSpriteProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch(CAT_ANIMATION_PATH)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => {
        /* retry on next mount */
      });
  }, []);

  if (!animationData) {
    return (
      <div
        className={className}
        style={{ width: "100%", height: "100%" }}
        aria-label="Animated cat running"
      />
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      renderer="svg"
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-label="Animated cat running"
    />
  );
}
