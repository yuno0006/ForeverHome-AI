"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Zap, RotateCcw, X, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  life: number;
}

const GRAVITY = 0.15;
const GAME_DURATION = 45;

export function CatMouseGame({ onClose }: { onClose?: () => void }) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(0);
  const [catX, setCatX] = useState(50);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("catVibeHighScore");
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const spawnParticle = useCallback((time: number) => {
    const spawnRate = Math.max(200, 800 - score * 5); // Speeds up as score increases
    if (time - lastSpawnRef.current > spawnRate) {
      const emojis = ["🐭", "🐭", "🐭", "🐟", "🐟", "🧀", "🎾", "✨", "💣"];
      const weights = [0.4, 0.4, 0.4, 0.2, 0.2, 0.1, 0.1, 0.05, 0.15];
      
      const rand = Math.random();
      let cumulative = 0;
      let emoji = "🐭";
      for (let i = 0; i < emojis.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          emoji = emojis[i];
          break;
        }
      }

      const newParticle: Particle = {
        id: particleIdRef.current++,
        x: Math.random() * 90 + 5,
        y: -10,
        emoji,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        life: 1,
      };

      setParticles((prev) => [...prev, newParticle]);
      lastSpawnRef.current = time;
    }
  }, [score]);

  const update = useCallback((time: number) => {
    setParticles((prev) => {
      const next = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + GRAVITY,
        }))
        .filter((p) => p.y < 110);

      // Collision Detection
      const caught = next.filter((p) => {
        const dx = p.x - catX;
        const dy = p.y - 85; // Cat is at bottom
        return Math.sqrt(dx * dx + dy * dy) < 8;
      });

      if (caught.length > 0) {
        caught.forEach(p => {
          if (p.emoji === "💣") {
            setScore(s => Math.max(0, s - 10));
            setCombo(0);
            setMultiplier(1);
          } else {
            const points = p.emoji === "✨" ? 50 : p.emoji === "🐟" ? 15 : 10;
            setScore(s => s + points * multiplier);
            setCombo(c => {
              const newC = c + 1;
              if (newC % 5 === 0) setMultiplier(m => Math.min(5, m + 1));
              return newC;
            });
          }
        });
        return next.filter(p => !caught.includes(p));
      }

      return next;
    });

    spawnParticle(time);
    requestRef.current = requestAnimationFrame(update);
  }, [catX, spawnParticle, multiplier]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setParticles([]);
    setCombo(0);
    setMultiplier(1);
    lastSpawnRef.current = performance.now();
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState("over");
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "over" && score > highScore) {
      setHighScore(score);
      localStorage.setItem("catVibeHighScore", score.toString());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [gameState, score, highScore]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setCatX(Math.max(5, Math.min(95, x)));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative bg-cocoa rounded-[40px] border-4 border-white shadow-2xl overflow-hidden aspect-[4/5] sm:aspect-square select-none cursor-none"
      >
        {/* Background Atmosphere */}
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-coral/20 to-transparent" />

        {/* HUD */}
        <div className="absolute top-6 inset-x-6 flex items-center justify-between z-30">
          <div className="space-y-1">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <Zap className="w-5 h-5 text-honey fill-honey" />
              <span className="text-2xl font-black text-white tabular-nums">{score}</span>
            </div>
            {multiplier > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center">
                <Badge className="bg-honey text-cocoa animate-bounce">x{multiplier} MULTIPLIER</Badge>
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
              <Timer className={`w-5 h-5 ${timeLeft < 10 ? "text-coral animate-pulse" : "text-white"}`} />
              <span className="text-xl font-bold text-white tabular-nums">{timeLeft}s</span>
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Best: {highScore}</div>
          </div>
        </div>

        {/* Game State Screens */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-cocoa/80 backdrop-blur-lg p-8 text-center"
            >
              <div className="w-24 h-24 rounded-[32px] bg-coral flex items-center justify-center text-6xl shadow-2xl mb-6 animate-float">🐱</div>
              <h2 className="font-display text-4xl font-black text-white mb-2">Catch the Vibe!</h2>
              <p className="text-white/60 font-medium mb-8 max-w-xs">
                Move the cat to catch falling mice, fish and snacks! Avoid the bombs.
              </p>
              <Button className="bg-coral text-white hover:bg-coral-deep px-6 py-3 rounded-full font-bold" size="lg" onClick={startGame}>
                <Play className="w-5 h-5 fill-current mr-2" /> Start Hunting
              </Button>
            </motion.div>
          )}

          {gameState === "over" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-cocoa/90 backdrop-blur-xl p-8 text-center"
            >
              <div className="text-7xl mb-4">{score >= highScore ? "🏆" : "😸"}</div>
              <h2 className="font-display text-5xl font-black text-white mb-2">{score}</h2>
              <p className="text-white/50 font-bold uppercase tracking-widest mb-8">Final Score</p>
              <div className="flex gap-3">
                <Button className="bg-coral text-white hover:bg-coral-deep px-6 py-3 rounded-full font-bold" onClick={startGame}>
                  <RotateCcw className="w-5 h-5 mr-2" /> Replay
                </Button>
                <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-full font-bold" onClick={onClose}>
                  <X className="w-5 h-5 mr-2" /> Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gameplay Area */}
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-4xl pointer-events-none drop-shadow-xl"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Player Cat */}
          <motion.div
            className="absolute bottom-10 text-7xl pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            animate={{ left: `${catX}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="relative">
               <span className="relative z-10">🐈</span>
               {/* Tail wag */}
               <div className="absolute -left-2 top-8 w-4 h-8 bg-cocoa/0 animate-tail-wag origin-top" />
            </div>
          </motion.div>
        </div>
        
        {/* Controls footer */}
        <div className="absolute bottom-4 inset-x-0 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Move mouse to control cat</p>
        </div>
      </div>
    </div>
  );
}
