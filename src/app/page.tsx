"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cat,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  PawPrint,
  Star,
  Zap,
  MessageCircle,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CatEarCard,
  PawRating,
  StickerBadge,
  SectionTag,
} from "@/components/ui/CatElements";
import { FunFactsSlideshow } from "@/components/ui/FunFactsSlideshow";
import confetti from "canvas-confetti";

const heroCats = [
  { name: "Barnaby", breed: "British Shorthair Mix", age: "6 yrs", img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=800&fit=crop", trait: "Gentle Soul" },
  { name: "Luna", breed: "Siamese Mix", age: "3 yrs", img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=800&fit=crop", trait: "Calm Queen" },
  { name: "Milo", breed: "Orange Tabby", age: "1 yr", img: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=800&fit=crop", trait: "Playful" },
  { name: "Shadow", breed: "Black Shorthair", age: "11 yrs", img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&h=800&fit=crop", trait: "Wise" },
  { name: "Pepper", breed: "Tuxedo", age: "1 yr", img: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&h=800&fit=crop", trait: "Curious" },
  { name: "Mochi", breed: "Calico", age: "5 yrs", img: "https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=600&h=800&fit=crop", trait: "Sweet" },
];

export default function HomePage() {
  const [selectedCat, setSelectedCat] = useState(0);
  const [loved, setLoved] = useState(false);

  const handleLove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loved) {
      setLoved(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ["#FF6B6B", "#9B8CE0", "#5FC79B"] });
    } else setLoved(false);
  };

  return (
    <div className="min-h-screen pb-24 overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative pt-10 sm:pt-16 pb-20 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7 relative"
          >
            {/* Floating sticker */}
            <StickerBadge color="honey" rotate={-8} className="absolute -top-4 right-4 sm:right-20 animate-float z-20 hidden sm:inline-flex">
              <Sparkles className="w-3.5 h-3.5" /> #hackthekitty 2026
            </StickerBadge>

            <div className="inline-flex items-center gap-2 bg-white border-2 border-cocoa rounded-full pl-1.5 pr-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)]">
              <span className="flex items-center gap-1 bg-cocoa text-cream text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" /> LIVE
              </span>
              <span className="text-sm font-semibold text-cocoa">9 cats looking for homes</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cocoa leading-[0.95] tracking-tight">
              Every cat<br />
              deserves a<br />
              <span className="relative inline-block">
                <span className="text-gradient-warm italic">forever</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 24" fill="none" preserveAspectRatio="none">
                  <path d="M6 16C70 6 230 6 294 16" stroke="#FF6B6B" strokeWidth="6" strokeLinecap="round" />
                  <path d="M20 20C90 13 210 13 280 20" stroke="#F5B942" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                </svg>
              </span>{" "}
              home.
            </h1>

            <p className="text-lg text-cocoa/70 font-medium max-w-md leading-relaxed">
              Every forever home is a new base of operations. Meet adorable cats, get 
              matched by our AI, and help one more feline peacefully rule the world.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/cats">
                <Button className="bg-coral text-white hover:bg-coral-deep px-6 py-3 rounded-full font-bold shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all" size="lg">
                  <PawPrint className="w-5 h-5 mr-2" />
                  Meet the Cats
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats row — factual, verifiable against demo data */}
            <div className="flex items-center gap-6 pt-6 border-t-2 border-cocoa/10">
              {[
                { value: "9", label: "Cats available" },
                { value: "14", label: "Day protocol", star: false },
                { value: "3", label: "Partner shelters", star: false },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-black text-cocoa flex items-center gap-1">
                    {s.value}
                    {s.star && <Star className="w-5 h-5 fill-honey text-honey" />}
                  </p>
                  <p className="text-xs font-bold text-cocoa/50 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive cat card stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            {/* Decorative back cards */}
            <div className="absolute inset-0 bg-lavender rounded-[32px] border-2 border-cocoa rotate-6 scale-95 opacity-40" />
            <div className="absolute inset-0 bg-sage rounded-[32px] border-2 border-cocoa -rotate-3 scale-97 opacity-50" />

            <CatEarCard earColor="coral" hover={false}>
              <div className="relative aspect-[16/10] rounded-t-[26px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCat}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image src={heroCats[selectedCat].img} alt={heroCats[selectedCat].name} fill className="object-cover" priority />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/60 via-transparent to-transparent" />

                {/* Compatibility sticker */}
                <div className="absolute top-3 right-3">
                  <StickerBadge color="sage" rotate={8}>
                    <Sparkles className="w-3 h-3" /> Compatibility Check
                  </StickerBadge>
                </div>

                {/* Love button */}
                <button
                  onClick={handleLove}
                  className={`absolute top-3 left-3 w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] transition-all active:scale-90 ${loved ? "bg-coral" : "bg-white"}`}
                >
                  <Heart className={`w-5 h-5 transition-all ${loved ? "text-white fill-white scale-110" : "text-cocoa"}`} />
                </button>

                {/* Name overlay */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-black text-white drop-shadow-lg">{heroCats[selectedCat].name}</h3>
                    <p className="text-white/90 font-semibold text-sm drop-shadow">{heroCats[selectedCat].breed} · {heroCats[selectedCat].age}</p>
                  </div>
                  <Badge className="bg-honey text-cocoa">{heroCats[selectedCat].trait}</Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <PawRating value={5} />
                  <span className="text-xs font-bold text-cocoa/50">Loved by {120 + selectedCat * 7} people</span>
                </div>

                {/* Thumbnail strip */}
                <div className="flex gap-2">
                  {heroCats.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => { setSelectedCat(idx); setLoved(false); }}
                      className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedCat === idx ? "border-coral shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] scale-105" : "border-cocoa/10 opacity-50 hover:opacity-100"}`}
                    >
                      <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>

                <Link href="/cats" className="block">
                  <Button className="w-full bg-cocoa text-cream hover:bg-cocoa-soft rounded-full font-bold" >
                    Browse All Cats
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CatEarCard>
          </motion.div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <section className="relative py-4 bg-cocoa border-y-2 border-cocoa overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-8 pr-8">
              {["Vaccinated 🩺", "Microchipped 🔖", "Spayed & Neutered ✂️", "Vet Checked ✅", "9 Lives Protocol 🐾", "Rule-Based Matching 📋", "Transparent Scoring 🔍"].map((item) => (
                <span key={item} className="text-cream font-display font-bold text-lg flex items-center gap-8">
                  {item}
                  <PawPrint className="w-4 h-4 text-coral" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-4">
          <SectionTag>How it works</SectionTag>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-cocoa tracking-tight">
            Three steps to your<br /><span className="text-gradient-warm">purr-fect match</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { step: "01", icon: Cat, title: "Browse & discover", desc: "Explore profiles with personality traits, photos, and real compatibility scores.", color: "coral" as const, rotate: -2 },
            { step: "02", icon: Zap, title: "Take the quiz", desc: "Answer 5 scenario questions. Our rule engine identifies compatibility strengths and concerns for every cat.", color: "lavender" as const, rotate: 1 },
            { step: "03", icon: MessageCircle, title: "9 Lives + maintenance", desc: "Follow the 9 Lives core curriculum, then continue with Days 10–14 in Maintenance Mode for long-term settling support.", color: "sage" as const, rotate: -1 },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              style={{ rotate: `${item.rotate}deg` }}
            >
              <div className="bg-white rounded-3xl p-7 border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:shadow-[9px_9px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all duration-300 relative h-full">
                <span className="font-display absolute top-6 right-7 text-5xl font-black text-cocoa/8">{item.step}</span>
                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] ${item.color === "coral" ? "bg-coral" : item.color === "lavender" ? "bg-lavender" : "bg-sage"}`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl font-black text-cocoa mb-3">{item.title}</h3>
                <p className="text-cocoa/70 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionTag>Happy families</SectionTag>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Sarah M.", cat: "Luna", text: "The 9 Lives Dashboard helped me understand Luna's behavior so quickly. By Maintenance Mode, she felt completely at home.", rating: 5, color: "coral" as const },
            { name: "James T.", cat: "Milo", text: "The compatibility report was honest about Milo's energy level. Knowing what to expect made all the difference for a first-time owner.", rating: 5, color: "lavender" as const },
            { name: "Priya K.", cat: "Oliver", text: "Oliver's profile was spot-on — gentle, social, follows me everywhere. The daily tips made settling in so smooth.", rating: 5, color: "sage" as const },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border-2 border-cocoa shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] relative"
            >
              <Quote className={`w-8 h-8 mb-3 ${t.color === "coral" ? "text-coral" : t.color === "lavender" ? "text-lavender" : "text-sage"}`} fill="currentColor" />
              <p className="text-cocoa/80 font-medium leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <PawRating value={t.rating} size={16} className="mb-3" />
              <div className="flex items-center gap-3 pt-3 border-t-2 border-cocoa/10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white border-2 border-cocoa ${t.color === "coral" ? "bg-coral" : t.color === "lavender" ? "bg-lavender" : "bg-sage"}`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-cocoa text-sm">{t.name}</p>
                  <p className="text-xs text-cocoa/50 font-semibold">Adopted {t.cat}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== WHY US - DARK ===== */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-cocoa rounded-[32px] p-10 sm:p-14 border-2 border-cocoa shadow-[8px_8px_0px_0px_rgba(255,107,107,1)] relative overflow-hidden noise-overlay"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-coral/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-lavender/15 rounded-full blur-3xl" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <SectionTag className="[&_span]:!text-honey [&_span]:!border-honey">The promise</SectionTag>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-cream leading-[1.05]">
                More than adoption.
                <br />
                <span className="text-gradient-warm italic">A lifelong bond.</span>
              </h2>
              <p className="text-cream/70 font-medium leading-relaxed">
                The first 14 days are critical. The 9 Lives Protocol builds the core bond in Days 1–9,
                and Maintenance Mode keeps support going through Days 10–14 so your new cat feels safe and loved.
              </p>
              <Link href="/cats">
                <Button className="bg-honey text-cocoa hover:bg-honey/80 px-6 py-3 rounded-full font-bold shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all mt-2" size="lg">
                  <Heart className="w-5 h-5 mr-2" /> Start your journey
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "9", label: "Lives protocol", c: "text-coral" },
                { value: "24/7", label: "AI coach", c: "text-lavender" },
                { value: "3", label: "Partner shelters", c: "text-sage" },
                { value: "5", label: "Quiz questions", c: "text-honey" },
              ].map((s) => (
                <div key={s.label} className="bg-cream/10 backdrop-blur-sm p-5 rounded-2xl border-2 border-cream/20 text-center hover:bg-cream/15 transition-colors">
                  <p className={`font-display text-3xl font-black ${s.c}`}>{s.value}</p>
                  <p className="text-xs font-bold text-cream/60 uppercase tracking-wide mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-coral flex items-center justify-center border-2 border-cocoa shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] animate-wiggle">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-cocoa tracking-tight leading-[0.95]">
            Your next ruler<br /><span className="text-gradient-warm italic">is waiting.</span>
          </h2>
          <p className="text-cocoa/70 font-medium text-lg max-w-md mx-auto">
            Take the 2-minute quiz or browse our cats today. Help one more feline establish their forever base of operations.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/cats">
              <Button className="bg-coral text-white hover:bg-coral-deep px-6 py-3 rounded-full font-bold shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all" size="lg">
                <Cat className="w-5 h-5 mr-2" /> Browse Cats
              </Button>
            </Link>
            <Link href="/assessment/barnaby">
              <Button variant="outline" className="border-2 border-cocoa bg-transparent text-cocoa hover:bg-cocoa/5 px-6 py-3 rounded-full font-bold" size="lg">
                <Sparkles className="w-4 h-4 mr-2" /> Take Quiz
              </Button>
            </Link>
          </div>
          <p className="text-xs text-cocoa/40 font-medium pt-1">
            No account required — jump straight into the quiz
          </p>
        </motion.div>
      </section>

      {/* ===== FUN FACTS SLIDESHOW ===== */}
      <FunFactsSlideshow />

    </div>
  );
}
