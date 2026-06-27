"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LottieCatRunner() {
  const [catData, setCatData] = useState<any>(null);
  const positionRef = useRef({ x: -100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const catInnerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<"right" | "left">("right");

  useEffect(() => {
    fetch("/cat.json")
      .then((res) => res.json())
      .then((data) => setCatData(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!catData) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const speed = 55;
      const moveAmount = (speed * deltaTime) / 1000;
      const dir = directionRef.current;

      let newX = positionRef.current.x + (dir === "right" ? moveAmount : -moveAmount);

      const maxX = window.innerWidth - 80;
      const minX = -80;

      // When hitting boundaries, flip direction
      if (dir === "right" && newX >= maxX) {
        newX = maxX;
        directionRef.current = "left";
      } else if (dir === "left" && newX <= minX) {
        newX = minX;
        directionRef.current = "right";
      }

      positionRef.current.x = newX;

      if (containerRef.current) {
        containerRef.current.style.left = newX + "px";
      }
      if (catInnerRef.current) {
        // Use CSS transition for smooth flip (set in style below)
        const goingLeft = directionRef.current === "left";
        catInnerRef.current.style.transform = goingLeft ? "scaleX(-1)" : "scaleX(1)";
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [catData]);

  if (!catData) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-2 z-10 pointer-events-none"
      style={{ left: "-100px" }}
    >
      <div
        ref={catInnerRef}
        className="w-16 h-16 sm:w-20 sm:h-20"
        style={{ transform: "scaleX(1)", transition: "transform 0.3s ease" }}
      >
        <Lottie
          animationData={catData}
          loop={true}
          autoplay={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}