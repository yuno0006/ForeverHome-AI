"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cat,
  Sparkles,
  Sun,
  Landmark,
  Fingerprint,
  CandyOff,
  Moon,
  Wind,
  Ear,
  ArrowUp,
  Rocket,
  Crown,
  Eye,
  Activity,
  Maximize,
  MessageCircle,
  Droplets,
  Hand,
  Timer,
  DoorOpen,
  Ship,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from "lucide-react";
import { SectionTag } from "@/components/ui/CatElements";

const ALL_FACTS = [
  { icon: Sun, title: "Gods in Egypt", desc: "In Ancient Egypt, cats were considered magical creatures. The goddess Bastet was famously depicted with the head of a cat.", color: "honey", rotate: -2 },
  { icon: Landmark, title: "Roman Liberty", desc: "Romans viewed cats as the ultimate symbol of liberty. They were the only animals allowed inside temples and traveled with legions.", color: "sage", rotate: 1 },
  { icon: Sparkles, title: "Healing Purrs", desc: "A cat's purr vibrates at 25-140 Hz, which is the exact frequency shown to promote tissue regeneration and help bones heal faster!", color: "lavender", rotate: -1 },
  { icon: Fingerprint, title: "Nose Prints", desc: "Just like human fingerprints, every cat's nose pad has a completely unique pattern of ridges and bumps.", color: "coral", rotate: 2 },
  { icon: CandyOff, title: "No Sweet Tooth", desc: "Cats are genetically unable to taste sweetness. They are the only mammals known to lack this specific taste receptor.", color: "honey", rotate: -1 },
  { icon: Moon, title: "Sleepy Heads", desc: "Cats spend 70% of their lives sleeping. That means a 9-year-old cat has been awake for only about 3 years of its life!", color: "sage", rotate: 2 },
  { icon: Wind, title: "Whisker Radar", desc: "Cat whiskers are highly sensitive and can detect minute changes in air currents, helping them navigate in total darkness.", color: "lavender", rotate: -2 },
  { icon: Ear, title: "Ears on Swivel", desc: "A cat has 32 muscles in each ear, allowing them to independently rotate their ears up to 180 degrees.", color: "coral", rotate: 1 },
  { icon: ArrowUp, title: "Super Jumpers", desc: "Cats are incredible athletes and can jump up to six times their own height in a single bound.", color: "honey", rotate: 3 },
  { icon: Rocket, title: "Space Cat", desc: "In 1963, a French cat named Félicette became the first and only feline to travel to space—and she survived!", color: "sage", rotate: -1 },
  { icon: Crown, title: "Mayor Stubbs", desc: "A cat named Stubbs served as the honorary mayor of the town of Talkeetna, Alaska, for an impressive 20 years.", color: "lavender", rotate: 2 },
  { icon: Eye, title: "Glow in the Dark", desc: "A cat's eyes have a reflective layer that magnifies incoming light, allowing them to see in near total darkness.", color: "coral", rotate: -2 },
  { icon: Activity, title: "Flexible Spines", desc: "Cats have 53 loosely fitting vertebrae in their spine (humans only have 34), giving them incredible flexibility.", color: "honey", rotate: 1 },
  { icon: Maximize, title: "Liquid Cats", desc: "Cats don't have a rigid collarbone. This unique skeletal structure allows them to squeeze through any opening the size of their head.", color: "sage", rotate: -1 },
  { icon: MessageCircle, title: "Meowing for Us", desc: "Adult cats rarely meow at each other. They developed this vocalization almost exclusively to communicate with humans!", color: "lavender", rotate: 2 },
  { icon: Droplets, title: "Sweaty Paws", desc: "Cats don't have sweat glands all over their bodies like humans do. Instead, they cool down by sweating through their paw pads.", color: "coral", rotate: -1 },
  { icon: Hand, title: "Left or Right Pawed", desc: "Just like humans, cats can be right or left-pawed. Studies show female cats tend to be right-pawed, while males are left-pawed.", color: "honey", rotate: 2 },
  { icon: Timer, title: "Fast Runners", desc: "A domestic cat can sprint at speeds up to 30 miles per hour over short distances, faster than Usain Bolt!", color: "sage", rotate: -2 },
  { icon: DoorOpen, title: "Isaac Newton's Door", desc: "Sir Isaac Newton is credited with inventing the cat flap (pet door) so his cats wouldn't interrupt his optical experiments.", color: "lavender", rotate: 1 },
  { icon: Ship, title: "Viking Pets", desc: "Vikings used cats on their longships to catch mice. Some historians believe they even gave kittens as wedding gifts!", color: "coral", rotate: -1 },
];

export function FunFactsSlideshow() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(ALL_FACTS.length / itemsToShow);

  useEffect(() => {
    // Reset page if it exceeds totalPages due to resize
    if (currentPage >= totalPages) setCurrentPage(0);
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  const nextSlide = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevSlide = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const currentIndex = currentPage * itemsToShow;
  const currentFacts = ALL_FACTS.slice(currentIndex, currentIndex + itemsToShow);
  
  if (currentFacts.length < itemsToShow) {
    currentFacts.push(...ALL_FACTS.slice(0, itemsToShow - currentFacts.length));
  }

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto overflow-hidden relative">
      <div className="absolute top-10 left-10 w-64 h-64 bg-honey/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-sage/20 rounded-full blur-3xl -z-10" />
      
      <div className="text-center mb-12 space-y-4">
        <SectionTag>Did you know?</SectionTag>
        <h2 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
          Feline history & <br /><span className="text-gradient-warm">purr-fect facts</span>
        </h2>
      </div>

      <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className={`grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}
          >
            {currentFacts.map((item, idx) => (
              <div
                key={item.title + idx}
                style={{ rotate: `${item.rotate}deg` }}
                className="bg-white rounded-3xl p-7 border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:shadow-[9px_9px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] ${
                  item.color === "honey" ? "bg-honey" : item.color === "sage" ? "bg-sage" : item.color === "coral" ? "bg-coral" : "bg-lavender"
                }`}>
                  <item.icon className="w-7 h-7 text-cocoa" />
                </div>
                <h3 className="font-display text-2xl font-black text-cocoa mb-3">{item.title}</h3>
                <p className="text-cocoa/70 font-medium leading-relaxed mb-4">{item.desc}</p>
                <Cat className="absolute bottom-5 right-5 w-16 h-16 text-cocoa/5 -rotate-12 pointer-events-none" />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center mt-10">
          <div className="flex items-center gap-4">
            <button onClick={prevSlide} className="w-12 h-12 rounded-full border-2 border-cocoa flex items-center justify-center text-cocoa hover:bg-cocoa/5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button onClick={() => setIsPaused(!isPaused)} className="w-12 h-12 rounded-full border-2 border-cocoa flex items-center justify-center text-cocoa hover:bg-cocoa/5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 bg-white">
              {isPaused ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <button onClick={nextSlide} className="w-12 h-12 rounded-full border-2 border-cocoa flex items-center justify-center text-cocoa hover:bg-cocoa/5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2.5 rounded-full transition-all duration-300 border border-cocoa/20 ${
                  currentPage === i ? "w-8 bg-cocoa border-cocoa" : "w-2.5 bg-cocoa/20 hover:bg-cocoa/40"
                }`}
                aria-label={`Go to slide page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
