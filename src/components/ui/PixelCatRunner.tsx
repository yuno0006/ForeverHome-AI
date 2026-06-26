"use client";

import { useEffect, useRef, useState } from "react";

interface PawPrintData {
  id: string;
  x: number;
  y: number;
  opacity: number;
}

function PawPrint({ x, y, opacity }: { x: number; y: number; opacity: number }) {
  return (
    <div
      className="fixed pointer-events-none"
      style={{ left: x, bottom: y, opacity, transition: "opacity 2.5s ease-out" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-heart/20">
        <ellipse cx="12" cy="17" rx="5" ry="4" />
        <circle cx="6" cy="10" r="2.5" />
        <circle cx="11" cy="7.5" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
        <circle cx="19" cy="13" r="2" />
      </svg>
    </div>
  );
}

function CartoonCat({ frame, direction }: { frame: number; direction: "right" | "left" }) {
  const legOffsets = [
    { fl: -2, fr: 2, bl: 2, br: -2 },
    { fl: 0, fr: 0, bl: 0, br: 0 },
    { fl: 2, fr: -2, bl: -2, br: 2 },
    { fl: 0, fr: 0, bl: 0, br: 0 },
  ];
  const legs = legOffsets[frame % 4];
  const tailWag = Math.sin(frame * 0.7) * 6;
  const bodyBob = Math.sin(frame * 1.0) * 0.8;
  const earTwitch = Math.sin(frame * 0.3) * 2;

  const scaleX = direction === "left" ? -1 : 1;

  return (
    <svg
      width="55"
      height="45"
      viewBox="0 0 55 45"
      style={{ transform: `scaleX(${scaleX})`, overflow: "visible" }}
    >
      {/* Tail - fluffy */}
      <path
        d={`M 44 22 Q ${50 + tailWag} ${16 + tailWag * 0.4}, ${48 + tailWag * 0.6} ${8 + Math.abs(tailWag) * 0.2}`}
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body - round and chubby */}
      <ellipse cx="28" cy={22 + bodyBob} rx="14" ry="10" fill="#1A1A1A" />

      {/* Belly spot */}
      <ellipse cx="26" cy={25 + bodyBob} rx="8" ry="5" fill="#333" opacity="0.4" />

      {/* Head - big and round */}
      <circle cx="14" cy={15 + bodyBob} r="11" fill="#1A1A1A" />

      {/* Ears - triangular and cute */}
      <polygon points={`5,${7 + bodyBob} 3,${-1 + bodyBob + earTwitch} 10,${5 + bodyBob}`} fill="#1A1A1A" />
      <polygon points={`18,${5 + bodyBob} 22,${-2 + bodyBob - earTwitch} 24,${7 + bodyBob}`} fill="#1A1A1A" />
      {/* Inner ears - pink */}
      <polygon points={`6,${6.5 + bodyBob} 4.5,${1 + bodyBob + earTwitch} 9,${5.5 + bodyBob}`} fill="#FF8A80" opacity="0.7" />
      <polygon points={`18.5,${5.5 + bodyBob} 21.5,${0 + bodyBob - earTwitch} 23,${6.5 + bodyBob}`} fill="#FF8A80" opacity="0.7" />

      {/* Eyes - BIG and sparkly */}
      <ellipse cx="9" cy={13 + bodyBob} rx="3.5" ry="4" fill="white" />
      <ellipse cx="19" cy={13 + bodyBob} rx="3.5" ry="4" fill="white" />
      {/* Iris - warm amber */}
      <ellipse cx="9.5" cy={13.5 + bodyBob} rx="2.5" ry="3" fill="#FFC107" />
      <ellipse cx="19.5" cy={13.5 + bodyBob} rx="2.5" ry="3" fill="#FFC107" />
      {/* Pupils - big and cute */}
      <ellipse cx="10" cy={13.5 + bodyBob} rx="1.5" ry="2.5" fill="#1A1A1A" />
      <ellipse cx="20" cy={13.5 + bodyBob} rx="1.5" ry="2.5" fill="#1A1A1A" />
      {/* Eye shine - double sparkle */}
      <circle cx="8" cy={12 + bodyBob} r="1.2" fill="white" />
      <circle cx="10" cy={14 + bodyBob} r="0.6" fill="white" />
      <circle cx="18" cy={12 + bodyBob} r="1.2" fill="white" />
      <circle cx="20" cy={14 + bodyBob} r="0.6" fill="white" />

      {/* Nose - tiny pink triangle */}
      <polygon points={`13,${17 + bodyBob} 15,${17 + bodyBob} 14,${18.5 + bodyBob}`} fill="#FF8A80" />

      {/* Mouth - cute w shape */}
      <path
        d={`M 11 ${19.5 + bodyBob} Q 12.5 ${21 + bodyBob} 14 ${19.5 + bodyBob} Q 15.5 ${21 + bodyBob} 17 ${19.5 + bodyBob}`}
        stroke="#FF8A80"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <line x1="1" y1={16 + bodyBob} x2="7" y2={17 + bodyBob} stroke="#555" strokeWidth="0.4" />
      <line x1="1" y1={18 + bodyBob} x2="7" y2={18.5 + bodyBob} stroke="#555" strokeWidth="0.4" />
      <line x1="21" y1={17 + bodyBob} x2="27" y2={16 + bodyBob} stroke="#555" strokeWidth="0.4" />
      <line x1="21" y1={18.5 + bodyBob} x2="27" y2={18 + bodyBob} stroke="#555" strokeWidth="0.4" />

      {/* Cheek blush */}
      <circle cx="6" cy={17 + bodyBob} r="2" fill="#FF8A80" opacity="0.25" />
      <circle cx="22" cy={17 + bodyBob} r="2" fill="#FF8A80" opacity="0.25" />

      {/* Front legs - SHORT and stubby */}
      <line
        x1="20" y1={30 + bodyBob}
        x2={20 + legs.fl} y2={37 + bodyBob}
        stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"
      />
      <line
        x1="23" y1={30 + bodyBob}
        x2={23 + legs.fr} y2={37 + bodyBob}
        stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"
      />
      {/* Front paws - tiny */}
      <ellipse cx={20 + legs.fl} cy={38 + bodyBob} rx="2.5" ry="1.5" fill="#1A1A1A" />
      <ellipse cx={23 + legs.fr} cy={38 + bodyBob} rx="2.5" ry="1.5" fill="#1A1A1A" />

      {/* Back legs - SHORT and stubby */}
      <line
        x1="35" y1={30 + bodyBob}
        x2={35 + legs.bl} y2={37 + bodyBob}
        stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"
      />
      <line
        x1="38" y1={30 + bodyBob}
        x2={38 + legs.br} y2={37 + bodyBob}
        stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"
      />
      {/* Back paws - tiny */}
      <ellipse cx={35 + legs.bl} cy={38 + bodyBob} rx="2.5" ry="1.5" fill="#1A1A1A" />
      <ellipse cx={38 + legs.br} cy={38 + bodyBob} rx="2.5" ry="1.5" fill="#1A1A1A" />
    </svg>
  );
}

export default function PixelCatRunner() {
  const [frame, setFrame] = useState(0);
  const [pawPrints, setPawPrints] = useState<PawPrintData[]>([]);
  const [catPos, setCatPos] = useState(-70);
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState<"right" | "left">("right");

  const posRef = useRef(-70);
  const lastPawRef = useRef(-70);
  const counterRef = useRef(0);
  const visibleRef = useRef(true);
  const directionRef = useRef<"right" | "left">("right");

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 200);

    const moveInterval = setInterval(() => {
      if (!visibleRef.current) return;

      const speed = directionRef.current === "right" ? 2 : -2;
      posRef.current += speed;
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

      if (directionRef.current === "right" && posRef.current > screenWidth * 0.75) {
        directionRef.current = "left";
        setDirection("left");
      } else if (directionRef.current === "left" && posRef.current < screenWidth * 0.05) {
        visibleRef.current = false;
        setVisible(false);
        setCatPos(-70);
        posRef.current = -70;
        lastPawRef.current = -70;
        directionRef.current = "right";
        setDirection("right");

        setTimeout(() => {
          visibleRef.current = true;
          setVisible(true);
        }, 3000 + Math.random() * 6000);
        return;
      }

      setCatPos(posRef.current);

      const dist = Math.abs(posRef.current - lastPawRef.current);
      if (dist > 55 && posRef.current > 0) {
        lastPawRef.current = posRef.current;
        counterRef.current += 1;
        const id = `paw-${counterRef.current}-${Date.now()}`;
        const newPaw: PawPrintData = {
          id,
          x: posRef.current + 18,
          y: 4 + Math.random() * 3,
          opacity: 0.45,
        };
        setPawPrints((prev) => [...prev.slice(-8), newPaw]);

        setTimeout(() => {
          setPawPrints((prev) =>
            prev.map((pw) => (pw.id === id ? { ...pw, opacity: 0 } : pw))
          );
        }, 2500);

        setTimeout(() => {
          setPawPrints((prev) => prev.filter((pw) => pw.id !== id));
        }, 5000);
      }
    }, 16);

    return () => {
      clearInterval(frameInterval);
      clearInterval(moveInterval);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {pawPrints.map((paw) => (
        <PawPrint key={paw.id} x={paw.x} y={paw.y} opacity={paw.opacity} />
      ))}

      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: `${catPos}px`,
          bottom: "6px",
          transition: "opacity 0.5s",
        }}
      >
        <CartoonCat frame={frame} direction={direction} />
      </div>
    </>
  );
}
