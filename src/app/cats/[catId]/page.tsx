"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionTag, StickerBadge } from "@/components/ui/CatElements";
import { getCatById } from "@/data/demoCats";
import { getShelterById } from "@/data/demoShelters";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedCatIds, saveCatToWishlist, removeCatFromWishlist } from "@/lib/firestoreService";
import {
  Cat,
  Heart,
  MapPin,
  Clock,
  Zap,
  Sparkles,
  ShieldCheck,
  Syringe,
  Microchip,
  Home,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
  Baby,
  Dog,
  Volume2,
  Mountain,
  Activity,
  Hand,
  AlertCircle,
  Loader2,
  MessageCircle,
  PawPrint,
  GraduationCap,
  Stethoscope,
  ClipboardCheck,
  Send,
  Bot,
  Info,
} from "lucide-react";

/* ─── Helpers ─── */
const energyLabels: Record<string, string> = { low: "Calm", medium: "Moderate", high: "Energetic" };
const sociabilityLabels: Record<string, string> = { reserved: "Quiet", moderate: "Balanced", outgoing: "Social" };
const compatibilityIcon = {
  yes: { icon: "✅", color: "text-sage" },
  no: { icon: "⚠️", color: "text-coral" },
  unknown: { icon: "❓", color: "text-honey" },
} as const;

/* ─── AI Quiz Questions ─── */
const AI_QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: (catName: string) => `What kind of living space would you provide for ${catName}?`,
    options: [
      { value: "house", label: "🏠 House with outdoor access" },
      { value: "apartment", label: "🏢 Apartment / Condo" },
      { value: "studio", label: "🛋️ Studio / Small space" },
    ],
  },
  {
    id: "q2",
    question: (catName: string) => `How much time can you spend with ${catName} daily?`,
    options: [
      { value: "most-day", label: "🕐 Most of the day (work from home)" },
      { value: "part-day", label: "🕓 Part of the day" },
      { value: "evenings", label: "🌙 Evenings & weekends only" },
    ],
  },
  {
    id: "q3",
    question: () => `Have you owned a cat before?`,
    options: [
      { value: "experienced", label: "😺 Yes, experienced cat owner" },
      { value: "beginner", label: "🐱 First-time cat owner" },
      { value: "some", label: "📘 Some experience (friends/family cats)" },
    ],
  },
  {
    id: "q4",
    question: () => `What matters most to you in a feline companion?`,
    options: [
      { value: "cuddles", label: "🤗 Cuddles & affection" },
      { value: "play", label: "🎾 Playfulness & energy" },
      { value: "calm", label: "🧘 Calm & peaceful presence" },
      { value: "independence", label: "🦁 Independence" },
    ],
  },
];

/* ─── Photo Gallery ─── */
function PhotoGallery({ photos, name }: { photos: { url: string; caption?: string }[]; name: string }) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((p) => (p === 0 ? photos.length - 1 : p - 1));
  const next = () => setActive((p) => (p === photos.length - 1 ? 0 : p + 1));

  if (photos.length <= 1) return null;

  return (
    <div className="relative group">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={photos[active].url}
            alt={`${name} photo ${active + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {photos[active].caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-semibold">{photos[active].caption}</p>
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-cocoa rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-cocoa rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === active ? "bg-coral w-6" : "bg-cocoa/20 hover:bg-cocoa/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Behavior Bar ─── */
function BehaviorBar({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  const levels: Record<string, number> = { low: 1, moderate: 2, medium: 2, high: 3, reserved: 1, outgoing: 3 };
  const level = levels[value] || 2;
  const dots = [1, 2, 3];

  const colorMap: Record<number, string> = { 1: "bg-sage", 2: "bg-honey", 3: "bg-coral" };

  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="w-4 h-4 text-cocoa/40 flex-shrink-0" />
      <span className="text-sm font-semibold text-cocoa/60 w-24 flex-shrink-0">{label}</span>
      <div className="flex gap-1 flex-1 justify-end">
        {dots.map((d) => (
          <div
            key={d}
            className={`h-2 w-6 rounded-full transition-all ${
              d <= level ? colorMap[level] : "bg-cocoa/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── AI Quiz Chat Widget ─── */
function AIQuizWidget({ catName, catBreed, onStartAssessment }: { catName: string; catBreed: string; onStartAssessment: () => void }) {
  const [step, setStep] = useState<"intro" | "quiz" | "result" | "done">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiMessage, setAiMessage] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; content: string }[]>([]);

  const startQuiz = () => {
    setStep("quiz");
    setMessages([
      { role: "bot", content: `Hi! I'm ForeverHome AI 🐾 Let's see how well ${catName} fits your lifestyle. Ready?` },
    ]);
  };

  const handleAnswer = (value: string, label: string) => {
    const q = AI_QUIZ_QUESTIONS[currentQ];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    setMessages((prev) => [...prev, { role: "user", content: label }]);

    if (currentQ < AI_QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQ((p) => p + 1);
        const nextQ = AI_QUIZ_QUESTIONS[currentQ + 1];
        setMessages((prev) => [...prev, { role: "bot", content: nextQ.question(catName) }]);
      }, 500);
    } else {
      setStep("result");
      setLoadingAI(true);
      generateAIInsight(newAnswers);
    }
  };

  const generateAIInsight = async (userAnswers: Record<string, string>) => {
    try {
      const res = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compatibilityResult: { level: "moderate", concerns: [], strengths: [] },
          cat: {
            name: catName,
            breed: catBreed,
          },
          adopter: {
            homeType: userAnswers.q1,
            hoursAway: userAnswers.q2 === "most-day" ? 4 : userAnswers.q2 === "part-day" ? 8 : 12,
            householdNoise: "moderate",
          },
        }),
      });
      const data = await res.json();
      const insight = data.explanation || `Based on your answers, ${catName} seems like a promising match! Let's dive deeper with the full assessment to get a detailed compatibility report.`;
      setAiMessage(insight);
    } catch {
      setAiMessage(`Thanks for sharing! Based on what you've told me, let's run the full compatibility check for ${catName} to get a detailed report tailored to both of you.`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Card className="border border-white/60 bg-white/90 backdrop-blur-md shadow-xl shadow-cocoa/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-lavender to-sage px-5 py-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-lavender/30 overflow-hidden">
          <svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20 L8 8 L22 16 Z" fill="#F59E0B" />
            <path d="M13 19 L10 12 L18 17 Z" fill="#FCD34D" />
            <path d="M52 20 L56 8 L42 16 Z" fill="#F59E0B" />
            <path d="M51 19 L54 12 L46 17 Z" fill="#FCD34D" />
            <ellipse cx="32" cy="34" rx="21" ry="18" fill="#FBBF24" />
            <ellipse cx="32" cy="36" rx="19" ry="16" fill="#FDE68A" />
            <ellipse cx="24" cy="31" rx="5" ry="5.5" fill="white" />
            <ellipse cx="40" cy="31" rx="5" ry="5.5" fill="white" />
            <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#1E293B" />
            <ellipse cx="41" cy="31" rx="3" ry="3.5" fill="#1E293B" />
            <circle cx="26.5" cy="29.5" r="1.2" fill="white" />
            <circle cx="42.5" cy="29.5" r="1.2" fill="white" />
            <path d="M30 36 L32 39 L34 36 Z" fill="#F472B6" />
            <path d="M28 38 Q32 43 36 38" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M32 39 L32 40.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="34" x2="22" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="9" y1="38" x2="21" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="10" y1="42" x2="22" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="54" y1="34" x2="42" y2="36" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="55" y1="38" x2="43" y2="38" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="54" y1="42" x2="42" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <ellipse cx="18" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
            <ellipse cx="46" cy="38" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.4" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-black text-white text-lg leading-tight">AI Quick Match</h3>
          <p className="text-white/70 text-xs font-medium">Chat-based compatibility check</p>
        </div>
      </div>

      <CardContent className="p-5">
        {step === "intro" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-lavender-light flex items-center justify-center border-2 border-lavender/30 overflow-hidden">
              <svg viewBox="0 0 64 64" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20 L8 8 L22 16 Z" fill="#F59E0B" /><path d="M13 19 L10 12 L18 17 Z" fill="#FCD34D" />
                <path d="M52 20 L56 8 L42 16 Z" fill="#F59E0B" /><path d="M51 19 L54 12 L46 17 Z" fill="#FCD34D" />
                <ellipse cx="32" cy="34" rx="21" ry="18" fill="#FBBF24" /><ellipse cx="32" cy="36" rx="19" ry="16" fill="#FDE68A" />
                <ellipse cx="24" cy="31" rx="5" ry="5.5" fill="white" /><ellipse cx="40" cy="31" rx="5" ry="5.5" fill="white" />
                <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#1E293B" /><ellipse cx="41" cy="31" rx="3" ry="3.5" fill="#1E293B" />
                <circle cx="26.5" cy="29.5" r="1.2" fill="white" /><circle cx="42.5" cy="29.5" r="1.2" fill="white" />
                <path d="M30 36 L32 39 L34 36 Z" fill="#F472B6" />
                <path d="M28 38 Q32 43 36 38" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <path d="M32 39 L32 40.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h4 className="font-display font-black text-cocoa text-xl">Is {catName} right for you?</h4>
              <p className="text-sm text-cocoa/60 font-medium mt-1">
                Answer 4 quick questions and our AI will give you an instant compatibility preview — it only takes 30 seconds!
              </p>
            </div>
            <Button
              onClick={startQuiz}
              className="bg-lavender hover:bg-lavender-deep text-white rounded-full font-bold shadow-lg shadow-lavender/30 hover:shadow-xl hover:shadow-lavender/40 hover:-translate-y-0.5 transition-all duration-300 px-6 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Sparkles className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Start AI Quick Match</span>
            </Button>
          </motion.div>
        )}

        {step === "quiz" && (
          <div className="space-y-4">
            {/* Chat messages */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "bot" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm font-medium leading-relaxed transition-all duration-300 hover:shadow-md ${
                      m.role === "bot"
                        ? "bg-white/90 backdrop-blur-md border border-white/60 text-cocoa rounded-tl-sm shadow-sm shadow-cocoa/5"
                        : "bg-gradient-to-br from-lavender to-lavender-deep text-white rounded-tr-sm shadow-md shadow-lavender/20"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Question options */}
            <div className="pt-2 space-y-2 border-t border-cocoa/10">
              <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Choose your answer</p>
              {AI_QUIZ_QUESTIONS[currentQ].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value, opt.label)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/60 border border-white/60 hover:bg-lavender/5 hover:border-lavender/40 hover:shadow-md hover:shadow-lavender/5 transition-all duration-300 text-sm font-semibold text-cocoa"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-light flex items-center justify-center border-2 border-sage/30 overflow-hidden">
              {loadingAI ? (
                <Loader2 className="w-7 h-7 text-sage animate-spin" />
              ) : (
                <svg viewBox="0 0 64 64" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 20 L8 8 L22 16 Z" fill="#F59E0B" /><path d="M13 19 L10 12 L18 17 Z" fill="#FCD34D" />
                  <path d="M52 20 L56 8 L42 16 Z" fill="#F59E0B" /><path d="M51 19 L54 12 L46 17 Z" fill="#FCD34D" />
                  <ellipse cx="32" cy="34" rx="21" ry="18" fill="#FBBF24" /><ellipse cx="32" cy="36" rx="19" ry="16" fill="#FDE68A" />
                  <ellipse cx="24" cy="31" rx="5" ry="5.5" fill="white" /><ellipse cx="40" cy="31" rx="5" ry="5.5" fill="white" />
                  <ellipse cx="25" cy="31" rx="3" ry="3.5" fill="#1E293B" /><ellipse cx="41" cy="31" rx="3" ry="3.5" fill="#1E293B" />
                  <circle cx="26.5" cy="29.5" r="1.2" fill="white" /><circle cx="42.5" cy="29.5" r="1.2" fill="white" />
                  <path d="M30 36 L32 39 L34 36 Z" fill="#F472B6" />
                  <path d="M28 38 Q32 43 36 38" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-display font-black text-cocoa text-lg">
                {loadingAI ? "Analyzing your answers..." : "Here's what our AI thinks"}
              </h4>
              {aiMessage && (
                <p className="text-sm text-cocoa/60 font-medium mt-2 leading-relaxed">{aiMessage}</p>
              )}
            </div>
            {!loadingAI && (
              <Button
                onClick={onStartAssessment}
                className="bg-coral hover:bg-coral-deep text-white rounded-full font-bold shadow-lg shadow-coral/30 hover:shadow-xl hover:shadow-coral/40 hover:-translate-y-0.5 transition-all duration-300 px-6"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" /> Start Full Assessment
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */
export default function CatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const catId = params.catId as string;
  const cat = getCatById(catId);
  const shelter = cat ? getShelterById(cat.shelterId) : null;

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "quiz">("profile");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [catId]);

  useEffect(() => {
    if (!user) { setSaved(false); return; }
    fetchSavedCatIds(user.uid)
      .then((ids) => setSaved(ids.includes(catId)))
      .catch(() => {});
  }, [user, catId]);

  const toggleSaved = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      if (saved) {
        await removeCatFromWishlist(user.uid, catId);
      } else {
        await saveCatToWishlist(user.uid, catId);
      }
      setSaved(!saved);
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    } finally {
      setBusy(false);
    }
  };

  if (!cat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-coral-light flex items-center justify-center border-2 border-cocoa shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]">
            <Cat className="w-12 h-12 text-coral" />
          </div>
          <h1 className="font-display text-3xl font-black text-cocoa">Cat not found</h1>
          <p className="text-cocoa/60 font-medium">This feline friend may have already found their forever home.</p>
          <Link href="/cats">
            <Button className="bg-cocoa hover:bg-cocoa-soft text-cream rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,1)]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Browse All Cats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const photos = cat.photos && cat.photos.length > 0 ? cat.photos : [{ url: cat.photo, caption: cat.name }];

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* ─── Hero Section ─── */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
          {/* Back link */}
          <Link
            href="/cats"
            className="inline-flex items-center gap-2 text-sm font-bold text-cocoa/50 hover:text-cocoa transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all cats
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* ─── Photo Gallery ─── */}
            <div className="lg:col-span-3">
              <PhotoGallery photos={photos} name={cat.name} />

              {/* Mobile: key info shown here */}
              <div className="mt-6 lg:hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="font-display text-4xl font-black text-cocoa">{cat.name}</h1>
                      <Badge className="bg-sage text-white font-bold rounded-full px-3 py-1 border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]">
                        {cat.status === "available" ? "Available" : cat.status}
                      </Badge>
                    </div>
                    <p className="text-cocoa/50 font-semibold mt-1">
                      {cat.breed} · {cat.color} · {cat.age} {cat.lifeStage === "kitten" ? "months" : "yrs"} · {cat.sex}
                    </p>
                  </div>
                  {user && (
                    <button
                      onClick={toggleSaved}
                      disabled={busy}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] transition-all active:scale-90 flex-shrink-0 ${
                        saved ? "bg-coral" : "bg-white"
                      }`}
                    >
                      <Heart className={`w-5 h-5 transition-all ${saved ? "text-white fill-white scale-110" : "text-cocoa"}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Sidebar Info Card ─── */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] bg-white rounded-2xl overflow-hidden sticky top-24">
                {/* Desktop name header */}
                <div className="hidden lg:block p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="font-display text-3xl font-black text-cocoa">{cat.name}</h1>
                        <Badge className="bg-sage text-white font-bold rounded-full px-3 py-1 text-xs border-2 border-cocoa shadow-[2px_2px_0px_0px_rgba(42,29,20,1)]">
                          {cat.status === "available" ? "Available" : cat.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-cocoa/50 font-semibold mt-0.5">
                        {cat.breed} · {cat.color}
                      </p>
                    </div>
                    {user && (
                      <button
                        onClick={toggleSaved}
                        disabled={busy}
                        className={`h-11 w-11 rounded-xl flex items-center justify-center border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] transition-all active:scale-90 flex-shrink-0 ${
                          saved ? "bg-coral" : "bg-white"
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-all ${saved ? "text-white fill-white scale-110" : "text-cocoa"}`} />
                      </button>
                    )}
                  </div>
                </div>

                <CardContent className="space-y-4 p-5 pt-0 lg:pt-0">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-cream-dark rounded-xl p-3 text-center border border-cocoa/10">
                      <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Age</p>
                      <p className="font-display font-black text-cocoa text-lg">
                        {cat.age} {cat.lifeStage === "kitten" ? "mo" : "yrs"}
                      </p>
                    </div>
                    <div className="bg-cream-dark rounded-xl p-3 text-center border border-cocoa/10">
                      <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Sex</p>
                      <p className="font-display font-black text-cocoa text-lg capitalize">{cat.sex}</p>
                    </div>
                    <div className="bg-cream-dark rounded-xl p-3 text-center border border-cocoa/10">
                      <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Weight</p>
                      <p className="font-display font-black text-cocoa text-lg">{cat.weight || "—"}</p>
                    </div>
                    <div className="bg-cream-dark rounded-xl p-3 text-center border border-cocoa/10">
                      <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Life Stage</p>
                      <p className="font-display font-black text-cocoa text-lg capitalize">{cat.lifeStage}</p>
                    </div>
                  </div>

                  {/* Compatibility badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="gap-1.5 rounded-full bg-coral-light text-cocoa text-xs font-bold border-2 border-coral/30 px-2.5 py-1">
                      <Zap className="h-3.5 w-3.5 text-coral" /> {energyLabels[cat.behavior.energy]}
                    </Badge>
                    <Badge className="gap-1.5 rounded-full bg-lavender-light text-cocoa text-xs font-bold border-2 border-lavender/30 px-2.5 py-1">
                      <Sparkles className="h-3.5 w-3.5 text-lavender" /> {sociabilityLabels[cat.behavior.sociability]}
                    </Badge>
                    {cat.care.fivStatus === "positive" && (
                      <Badge className="gap-1.5 rounded-full bg-lavender-light text-lavender-deep text-xs font-bold border-2 border-lavender/30 px-2.5 py-1">
                        FIV+
                      </Badge>
                    )}
                  </div>

                  {/* Shelter Info */}
                  {shelter && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-cocoa/40 bg-cream-dark rounded-xl px-3 py-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{shelter.name}</span>
                      <span>·</span>
                      <span>{shelter.location.city}, {shelter.location.state}</span>
                    </div>
                  )}

                  {/* Days waiting */}
                  {cat.daysInShelter && cat.daysInShelter > 30 && (
                    <div className="flex items-center gap-2 bg-honey-light border-2 border-honey rounded-xl px-3 py-2">
                      <Clock className="h-4 w-4 text-honey" />
                      <span className="text-sm font-bold text-cocoa">
                        {cat.daysInShelter} days waiting for a home
                      </span>
                    </div>
                  )}

                  <Separator className="bg-cocoa/10" />

                  {/* Health badges */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">Health & Care</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 bg-sage-light border border-sage/20 rounded-full px-3 py-1.5">
                        <Syringe className="w-3.5 h-3.5 text-sage" />
                        <span className="text-xs font-bold text-cocoa">{cat.vaccinated ? "Vaccinated" : "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-sage-light border border-sage/20 rounded-full px-3 py-1.5">
                        <Microchip className="w-3.5 h-3.5 text-sage" />
                        <span className="text-xs font-bold text-cocoa">{cat.microchipped ? "Microchipped" : "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-sage-light border border-sage/20 rounded-full px-3 py-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                        <span className="text-xs font-bold text-cocoa">{cat.neutered ? "Neutered" : "Not Neutered"}</span>
                      </div>
                    </div>
                    {cat.care.knownMedicalNeeds !== "None" && (
                      <div className="flex items-start gap-2 bg-coral-light border border-coral/20 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-coral uppercase">Medical Note</p>
                          <p className="text-sm font-medium text-cocoa">{cat.care.knownMedicalNeeds}</p>
                          {cat.care.medicationNeeds !== "None" && (
                            <p className="text-xs text-cocoa/60 mt-0.5">{cat.care.medicationNeeds}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={() => router.push(`/assessment/${cat.id}`)}
                      className="w-full bg-coral hover:bg-coral-deep text-white rounded-full font-bold py-5 text-base shadow-[4px_4px_0px_0px_rgba(42,29,20,1)]"
                    >
                      <ClipboardCheck className="w-5 h-5 mr-2" /> Start Compatibility Assessment
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("adoption-process");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full border-2 border-cocoa bg-white hover:bg-cocoa/5 text-cocoa rounded-full font-bold py-5"
                    >
                      <Home className="w-5 h-5 mr-2" /> Begin Adoption Process
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cat Profile Content ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* ─── Personality Traits ─── */}
                {cat.personality && cat.personality.length > 0 && (
                  <section>
                    <SectionTag>Personality</SectionTag>
                    <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                      What makes {cat.name} special
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {cat.personality.map((trait, i) => (
                        <motion.div
                          key={trait.trait}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="bg-white rounded-2xl p-5 border-2 border-cocoa/10 shadow-[3px_3px_0px_0px_rgba(42,29,20,0.5)] hover:-translate-y-1 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{["🌟","💫","✨","🎯"][i % 4]}</span>
                            <h4 className="font-display font-black text-cocoa">{trait.trait}</h4>
                          </div>
                          <p className="text-sm text-cocoa/60 font-medium leading-relaxed">{trait.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ─── Backstory ─── */}
                {cat.backstory && (
                  <section>
                    <SectionTag>Backstory</SectionTag>
                    <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                      {cat.name}&apos;s journey
                    </h2>
                    <Card className="border-2 border-cocoa/10 bg-white shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="hidden sm:block w-1 bg-gradient-to-b from-coral via-lavender to-sage rounded-full flex-shrink-0" />
                          <div>
                            <p className="text-cocoa/70 font-medium leading-relaxed text-[15px]">{cat.backstory}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cocoa/40">
                              <GraduationCap className="w-4 h-4" />
                              <span>Arrived at shelter: {new Date(cat.arrivalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* ─── Behavior Profile ─── */}
                <section>
                  <SectionTag>Behavior</SectionTag>
                  <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                    Detailed behavior profile
                  </h2>
                  <Card className="border-2 border-cocoa/10 bg-white shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-2xl">
                    <CardContent className="p-6 space-y-1">
                      <BehaviorBar label="Energy Level" value={cat.behavior.energy} icon={Zap} />
                      <BehaviorBar label="Sociability" value={cat.behavior.sociability} icon={Users} />
                      <BehaviorBar label="Stress Sensitivity" value={cat.behavior.stressSensitivity} icon={Activity} />
                      <BehaviorBar label="Handling Tolerance" value={cat.behavior.handlingTolerance} icon={Hand} />
                      <BehaviorBar label="Play Needs" value={cat.behavior.playNeeds} icon={Sparkles} />
                      <BehaviorBar label="Noise Tolerance" value={cat.behavior.noiseTolerance} icon={Volume2} />
                      <BehaviorBar label="Vertical Space" value={cat.behavior.needsVerticalSpace} icon={Mountain} />

                      <Separator className="my-3 bg-cocoa/10" />

                      <p className="text-xs font-bold text-cocoa/40 uppercase tracking-wider mb-2">Compatibility With</p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          { label: "Children", value: cat.behavior.comfortableWithChildren, icon: Baby },
                          { label: "Other Cats", value: cat.behavior.comfortableWithCats, icon: Cat },
                          { label: "Dogs", value: cat.behavior.comfortableWithDogs, icon: Dog },
                        ].map((item) => {
                          const ico = compatibilityIcon[item.value as keyof typeof compatibilityIcon];
                          return (
                            <div
                              key={item.label}
                              className="bg-cream-dark rounded-xl p-3 text-center border border-cocoa/10"
                            >
                              <item.icon className="w-4 h-4 mx-auto mb-1 text-cocoa/30" />
                              <p className="text-[10px] font-bold text-cocoa/40 uppercase">{item.label}</p>
                              <p className={`text-sm font-black ${ico.color}`}>
                                {ico.icon} {item.value}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-cocoa/40">
                        <Home className="w-3.5 h-3.5" />
                        <span>{cat.behavior.indoorOnlyRequired ? "Indoor only required" : "Indoor/outdoor OK"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ─── Ideal Home ─── */}
                {cat.idealHome && (
                  <section>
                    <SectionTag>Ideal Match</SectionTag>
                    <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                      The perfect home for {cat.name}
                    </h2>
                    <Card className="border-2 border-cocoa/10 bg-gradient-to-br from-sage-light/50 to-cream shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center flex-shrink-0 border-2 border-cocoa/10">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-cocoa/70 font-medium leading-relaxed text-[15px]">{cat.idealHome}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* ─── Care Notes ─── */}
                <section>
                  <SectionTag>Care</SectionTag>
                  <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                    Special care & notes
                  </h2>
                  <Card className="border-2 border-cocoa/10 bg-white shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Stethoscope className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-cocoa">Medical Needs</p>
                          <p className="text-sm text-cocoa/60 font-medium">{cat.care.knownMedicalNeeds}</p>
                          {cat.care.medicationNeeds !== "None" && (
                            <p className="text-xs text-cocoa/40 mt-0.5">{cat.care.medicationNeeds}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-lavender flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-cocoa">FIV Status</p>
                          <Badge variant="secondary" className={`text-xs font-bold capitalize ${
                            cat.care.fivStatus === "positive" ? "bg-coral-light text-coral-deep" : "bg-sage-light text-sage-deep"
                          }`}>
                            {cat.care.fivStatus}
                          </Badge>
                        </div>
                      </div>
                      <Separator className="bg-cocoa/10" />
                      <div>
                        <p className="text-sm font-bold text-cocoa mb-1">Special Notes</p>
                        <p className="text-sm text-cocoa/60 font-medium leading-relaxed">{cat.care.specialNotes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ─── Adoption Process ─── */}
                <section id="adoption-process">
                  <SectionTag>Next Steps</SectionTag>
                  <h2 className="font-display text-2xl font-black text-cocoa mt-2 mb-4">
                    Ready to adopt {cat.name}?
                  </h2>
                  <Card className="border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] bg-gradient-to-br from-coral via-coral-deep to-cocoa-soft text-white rounded-2xl overflow-hidden">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                          <PawPrint className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                          <h3 className="font-display text-2xl font-black">The Adoption Process</h3>
                          <p className="text-white/80 font-medium text-sm mt-1 leading-relaxed">
                            Start with our AI-powered compatibility assessment. It takes 2 minutes and gives you a personalized report on how well {cat.name} fits your lifestyle — with actionable guidance.
                          </p>
                          {cat.adoptionFee && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 border border-white/20">
                              <span className="text-xs font-bold text-white/70">Adoption Fee</span>
                              <span className="font-display font-black text-xl">${cat.adoptionFee}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 grid sm:grid-cols-3 gap-3">
                        {[
                          { step: 1, label: "Take the compatibility assessment", icon: ClipboardCheck },
                          { step: 2, label: "Review your AI-powered report", icon: Bot },
                          { step: 3, label: "Connect with the shelter to adopt", icon: Home },
                        ].map((s) => (
                          <div key={s.step} className="bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                            <div className="w-8 h-8 mx-auto rounded-lg bg-white/20 flex items-center justify-center mb-2">
                              <s.icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Step {s.step}</p>
                            <p className="text-sm font-bold text-white mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => router.push(`/assessment/${cat.id}`)}
                          className="flex-1 bg-white hover:bg-white/90 text-coral rounded-full font-bold py-5 text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]"
                        >
                          <Sparkles className="w-5 h-5 mr-2" /> Start Assessment Now
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        {shelter && (
                          <Link href={`/shelters/${cat.shelterId}`} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-2 border-white/30 bg-transparent hover:bg-white/10 text-white rounded-full font-bold py-5 text-base"
                            >
                              <MapPin className="w-5 h-5 mr-2" /> Visit {shelter.name}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              {/* ─── Desktop Sticky Sidebar ─── */}
              <div className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                  {/* Fun fact card */}
                  <Card className="border-2 border-cocoa/10 bg-white shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] rounded-2xl overflow-hidden">
                    <div className="bg-honey px-5 py-3">
                      <p className="font-display font-black text-cocoa text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Quick Facts
                      </p>
                    </div>
                    <CardContent className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Breed</span>
                        <span className="font-bold text-cocoa">{cat.breed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Color</span>
                        <span className="font-bold text-cocoa">{cat.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Weight</span>
                        <span className="font-bold text-cocoa">{cat.weight || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Age</span>
                        <span className="font-bold text-cocoa">{cat.age} {cat.lifeStage === "kitten" ? "months" : "years"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Sex</span>
                        <span className="font-bold text-cocoa capitalize">{cat.sex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Neutered</span>
                        <span className="font-bold text-cocoa">{cat.neutered ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Vaccinated</span>
                        <span className="font-bold text-cocoa">{cat.vaccinated ? "Yes" : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cocoa/50 font-medium">Microchipped</span>
                        <span className="font-bold text-cocoa">{cat.microchipped ? "Yes" : "—"}</span>
                      </div>
                      {cat.adoptionFee !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-cocoa/50 font-medium">Adoption Fee</span>
                          <span className="font-bold text-coral">${cat.adoptionFee}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shelter card */}
                  {shelter && (
                    <Card className="border-2 border-cocoa/10 bg-white shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] rounded-2xl overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center border-2 border-sage/20">
                            <Home className="w-5 h-5 text-sage" />
                          </div>
                          <div>
                            <p className="font-display font-black text-cocoa text-sm">{shelter.name}</p>
                            <p className="text-xs text-cocoa/50 font-medium">
                              {shelter.location.city}, {shelter.location.state}
                            </p>
                          </div>
                        </div>
                        <Link href={`/shelters/${cat.shelterId}`}>
                          <Button variant="outline" size="sm" className="w-full rounded-full border-2 border-cocoa/20 text-cocoa text-xs font-bold">
                            View Shelter Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}

