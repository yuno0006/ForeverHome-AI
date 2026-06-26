"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface PawPrint {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export default function LottieCatRunner() {
  const [pawPrints, setPawPrints] = useState<PawPrint[]>([]);
  const [catData, setCatData] = useState<any>(null);

  // Use refs for animation state to avoid stale closures
  const positionRef = useRef({ x: 50, y: 0 });
  const directionRef = useRef<"right" | "left">("right");
  const containerRef = useRef<HTMLDivElement>(null);
  const catInnerRef = useRef<HTMLDivElement>(null);
  const pawPrintIdRef = useRef(0);
  const lastPawTime = useRef(0);
  const startX = 50;

  // Load cat.json
  useEffect(() => {
    fetch("/cat.json")
      .then((res) => res.json())
      .then((data) => setCatData(data))
      .catch(console.error);
  }, []);

  // Animation loop using refs (no stale closures)
  useEffect(() => {
    if (!catData) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const pos = positionRef.current;
      const dir = directionRef.current;
      const speed = 80;
      const moveAmount = (speed * deltaTime) / 1000;
      let newX = pos.x + (dir === "right" ? moveAmount : -moveAmount);

      // Calculate patrol boundaries
      const maxX = startX + window.innerWidth * 0.8;
      const minX = startX;

      // Patrol: turn around at boundaries
      if (dir === "right" && newX >= maxX) {
        newX = maxX;
        directionRef.current = "left";
      } else if (dir === "left" && newX <= minX) {
        newX = minX;
        directionRef.current = "right";
      }

      pos.x = newX;

      // Update DOM directly (no React re-render)
      if (containerRef.current) {
        containerRef.current.style.left = `${newX}px`;
      }
      if (catInnerRef.current) {
        // cat.json native direction is LEFT, so:
        // Going LEFT  → scaleX(1)   → cat faces left  ← head forward
        // Going RIGHT → scaleX(-1)  → cat faces right → head forward
        const flip = directionRef.current === "right" ? -1 : 1;
        catInnerRef.current.style.transform = `scaleX(${flip})`;
      }

      // Add paw prints every 300ms
      if (currentTime - lastPawTime.current > 300) {
        const pawId = pawPrintIdRef.current++;
        const pawX = newX + (directionRef.current === "right" ? 50 : 20);
        const pawY = 60;

        setPawPrints((prev) => [
          ...prev.slice(-15),
          { id: pawId, x: pawX, y: pawY, opacity: 1 },
        ]);

        lastPawTime.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [catData]);

  // Fade out paw prints
  useEffect(() => {
    const interval = setInterval(() => {
      setPawPrints((prev) =>
        prev
          .map((paw) => ({ ...paw, opacity: paw.opacity - 0.05 }))
          .filter((paw) => paw.opacity > 0)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!catData) return null;

  return (
    <>
      {/* Paw Prints */}
      {pawPrints.map((paw) => (
        <div
          key={paw.id}
          className="fixed pointer-events-none z-0"
          style={{
            left: paw.x,
            bottom: 16,
            opacity: paw.opacity,
            transform: `scale(${0.5 + paw.opacity * 0.5})`,
            transition: "opacity 0.1s linear, transform 0.1s linear",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Paw pad */}
            <ellipse cx="12" cy="16" rx="4" ry="3.5" fill="#FFC107" opacity="0.5" />
            {/* Toes */}
            <circle cx="7" cy="11" r="2.2" fill="#FFC107" opacity="0.5" />
            <circle cx="11" cy="9" r="2.2" fill="#FFC107" opacity="0.5" />
            <circle cx="15.5" cy="10.5" r="2.2" fill="#FFC107" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Lottie Cat */}
      <div
        ref={containerRef}
        className="fixed bottom-4 z-10 pointer-events-none"
        style={{ left: "50px" }}
      >
        <div
          ref={catInnerRef}
          className="w-28 h-28 sm:w-36 sm:h-36"
          style={{
            transform: "scaleX(-1)", /* default: going right, cat native faces left */
          }}
        >
          <Lottie
            animationData={catData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </>
  );
}
