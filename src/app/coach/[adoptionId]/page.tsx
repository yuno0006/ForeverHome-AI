"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCatById } from "@/data/demoCats";
import { demoCheckIns } from "@/data/demoCheckIns";
import { useAuth } from "@/hooks/useAuth";
import { getIdToken } from "@/lib/auth";
import { nineLives, getCurrentLife, getLivesProgress, protocolCompletionMessage } from "@/data/nineLivesProtocol";
import { isMedicalEmergency } from "@/lib/medicalEscalation";
import { getCoachFallbackResponse } from "@/lib/fallbackExplanations";
import { DailyCheckIn } from "@/types/checkIn";
import { ChatMessage } from "@/types/coach";
import ChatBubble from "@/components/coach/ChatBubble";
import MedicalEscalation from "@/components/coach/MedicalEscalation";
import EmergencyContacts from "@/components/coach/EmergencyContacts";
import SmartEscalationModal from "@/components/coach/SmartEscalationModal";
import ProgressTimeline from "@/components/coach/ProgressTimeline";
import { CatMouseGame } from "@/components/CatMouseGame";
import Link from "next/link";
import { Send, AlertCircle, Heart, Trophy, PawPrint, ChevronRight, Sparkles, LogIn } from "lucide-react";

export default function CoachPage() {
  const params = useParams();
  const adoptionId = params.adoptionId as string;
  const { user } = useAuth();

  // Adoption IDs follow the pattern "{catId}-adoption-{n}" (see demoCheckIns.ts
  // and the links that create them in dashboard/report pages). Derive the cat
  // from the id instead of hardcoding Barnaby, so the coach works for any cat.
  const derivedCatId = adoptionId.split("-adoption")[0];
  const cat = getCatById(derivedCatId) || getCatById("barnaby");
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(
    demoCheckIns.filter((c) => c.adoptionId === adoptionId).length > 0
      ? demoCheckIns.filter((c) => c.adoptionId === adoptionId)
      : []
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGame, setShowGame] = useState(false);
  
  // New 9 Lives check-in state
  const [todayAte, setTodayAte] = useState<boolean | null>(null);
  const [todayLitter, setTodayLitter] = useState<"yes" | "no" | "diarrhea" | null>(null);
  const [todayPlay, setTodayPlay] = useState<boolean | null>(null);
  const [noEatWarning, setNoEatWarning] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Calculate current day and progress
  const currentDay = checkIns.length > 0 ? Math.max(...checkIns.map((c) => c.day)) + 1 : 1;
  const currentLife = getCurrentLife(currentDay);
  const progress = getLivesProgress(checkIns.length);
  
  // Check for consecutive no-eat days
  const lastTwoCheckIns = checkIns.slice(-2);
  const noEatDays = lastTwoCheckIns.filter(c => !c.ate).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Show celebration on Day 9 completion
    if (currentDay === 10 && checkIns.length >= 9) {
      setShowCelebration(true);
    }
  }, [currentDay, checkIns.length]);

  const handleSaveCheckIn = () => {
    if (todayAte === null || todayLitter === null || todayPlay === null) return;
    
    // Check for 2 consecutive no-eat days
    if (!todayAte && lastTwoCheckIns.filter(c => !c.ate).length >= 1) {
      setNoEatWarning(true);
    }
    
    const newCheckIn: DailyCheckIn = {
      adoptionId,
      day: currentDay,
      ate: todayAte,
      drank: true, // Assuming drinking if eating
      hiding: false, // Will be determined by behavior
      litterUsed: todayLitter === "yes",
      notes: `Play: ${todayPlay ? "Yes" : "No"}, Litter: ${todayLitter}`,
      timestamp: new Date().toISOString(),
    };
    
    setCheckIns((prev) => [...prev, newCheckIn]);
    
    // Reset check-in state
    setTodayAte(null);
    setTodayLitter(null);
    setTodayPlay(null);
    setNoEatWarning(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check for medical emergency
    if (isMedicalEmergency(inputValue)) {
      setShowEmergency(true);
      const emergencyMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "system",
        content: "🚨 MEDICAL EMERGENCY DETECTED",
        timestamp: new Date().toISOString(),
        isEmergency: true,
      };
      setMessages((prev) => [...prev, emergencyMsg]);
      setInputValue("");
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      // Call the AI coach API. Signed-in adopters use their own uid as the
      // profile reference (profiles are keyed by uid); everyone else falls
      // back to the "guest" demo profile used elsewhere in the app.
      const token = user ? await getIdToken() : null;
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: inputValue,
          catName: cat?.name || "your cat",
          catProfile: `${cat?.behavior?.energy} energy, ${cat?.behavior?.stressSensitivity} stress sensitivity`,
          currentDay,
          checkIns: checkIns.slice(-3),
          adopterProfileId: user?.uid || "guest",
        }),
      });

      const data = await res.json();
      const responseContent = data.response || data.message || generateLocalFallback(inputValue, cat?.name || "your cat", currentDay, checkIns, currentLife);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Coach API error:", error);
      // Fallback to local response
      const responseContent = generateLocalFallback(inputValue, cat?.name || "your cat", currentDay, checkIns, currentLife);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!cat) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-cat-dark">
            First 14 Days Coach
          </h1>
          {currentDay >= 9 && (
            <Trophy className="h-8 w-8 text-sunny" />
          )}
        </div>
        <p className="text-charcoal font-bold mb-4">
          Guiding {cat.name} through the critical first days in their new home
        </p>
        
        {/* 9 Lives Explanation Card */}
        <Card className="bg-cream-dark border-2 border-cocoa mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-cocoa mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              What is the 9 Lives Protocol?
            </h3>
            <p className="text-sm text-charcoal font-bold leading-relaxed">
              Just like cats are said to have 9 lives, new adoptions face 9 common challenges in the first days. 
              Each &ldquo;Life&rdquo; you survive together builds trust and strengthens your bond. 
              <strong className="text-cat-dark"> You don&apos;t lose lives — you earn them!</strong> 
              Complete all 9 to help {cat.name} feel at home.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-2 border-cocoa bg-white mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-sunny" />
              <span className="font-semibold text-cat-dark">
                {progress.livesCompleted} of 9 Challenges Survived
              </span>
            </div>
            <span className="text-sm text-charcoal font-bold">
              Day {currentDay} of 14
            </span>
          </div>
          <Progress value={progress.progressPercent} className="h-3 mb-4" />
          
          {/* Lives Progress Grid */}
          <div className="grid grid-cols-9 gap-2">
            {nineLives.map((life, index) => (
              <div
                key={life.life}
                className="flex flex-col items-center opacity-100"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
                    index < progress.livesCompleted
                      ? "bg-sunny text-white shadow-md"
                      : index === progress.livesCompleted
                      ? "bg-sunny/20 border-2 border-sunny"
                      : "bg-cream-dark border-2 border-cocoa/30"
                  }`}
                  title={life.title}
                >
                  {index < progress.livesCompleted ? "✓" : life.emoji}
                </div>
                <span className={`text-xs font-medium text-center ${
                  index <= progress.livesCompleted ? "text-sunny" : "text-charcoal font-bold"
                }`}>
                  {life.life}
                </span>
              </div>
            ))}
          </div>
          
          {/* Current Life Legend */}
          {currentLife && (
            <div className="mt-4 p-3 bg-sunny-light border-2 border-sunny/30 rounded-lg">
              <p className="text-sm text-cat-dark font-bold">
                <strong>Current Challenge:</strong> Life {currentLife.life} — {currentLife.title} {currentLife.emoji}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      {showCelebration && (
        <Card className="border-sunny bg-gradient-to-r from-sunny/10 to-risk-low/10 mb-6">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 text-sunny mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cat-dark mb-2">
              {protocolCompletionMessage.title}
            </h2>
            <p className="text-charcoal font-bold mb-4">
              {protocolCompletionMessage.subtitle}
            </p>
            <p className="text-sm text-charcoal font-bold mb-4">
              {protocolCompletionMessage.message}
            </p>
            <Button
              className="bg-sunny hover:bg-sunny/90 text-white"
              onClick={() => setShowGame(true)}
            >
              Play: Catch the Vibe 🎮
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Celebration mini-game — a little world-domination victory lap */}
      {showGame && (
        <div className="mb-6">
          <CatMouseGame onClose={() => setShowGame(false)} />
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-warm-cream rounded-lg p-3 border border-border mb-6 flex items-center gap-2 text-sm text-charcoal font-bold">
        <AlertCircle className="h-4 w-4 shrink-0 text-heart" />
        <p>
          This coach provides behavioral guidance, not veterinary advice.
          For medical concerns, contact your veterinarian immediately.
        </p>
      </div>

      {/* Guest sign-in nudge — chat still works, but progress won't be saved */}
      {!user && (
        <div className="flex items-center gap-2 bg-honey/10 border border-honey/25 rounded-xl px-4 py-2.5 mb-6 text-sm text-cocoa/70">
          <LogIn className="w-4 h-4 text-honey shrink-0" />
          <span>
            You&apos;re trying this out as a guest.{" "}
            <Link href="/login" className="font-bold underline hover:text-cocoa">Sign in</Link>{" "}
            to save {cat.name}&apos;s check-ins and chat history.
          </span>
        </div>
      )}

      {/* Emergency Contacts - Always visible */}
      <div className="mb-6">
        <EmergencyContacts />
      </div>

      {/* Medical Escalation */}
      {showEmergency && (
        <div className="mb-6">
          <MedicalEscalation />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Proactive Tracker + Current Life */}
        <div className="space-y-6">
          
          {/* Daily Check-In */}
          <Card className="border-2 border-cocoa bg-white shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-cocoa flex items-center gap-2 font-display font-black">
                <Heart className="h-5 w-5 text-coral" />
                Day {currentDay} Health Check
              </CardTitle>
              <p className="text-xs text-charcoal font-bold">
                Track {cat.name}&apos;s daily progress
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question 1: Eating */}
              <div>
                <p className="text-sm font-medium mb-2">🍗 Did {cat.name} eat today?</p>
                <div className="flex gap-2">
                  <Button
                    variant={todayAte === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayAte(true)}
                    className={todayAte === true ? "bg-risk-low hover:bg-risk-low/90" : ""}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={todayAte === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayAte(false)}
                    className={todayAte === false ? "bg-risk-high hover:bg-risk-high/90" : ""}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Question 2: Litter */}
              <div>
                <p className="text-sm font-medium mb-2">🚽 Did {cat.name} use the litter box?</p>
                <div className="flex gap-2">
                  <Button
                    variant={todayLitter === "yes" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayLitter("yes")}
                    className={todayLitter === "yes" ? "bg-risk-low hover:bg-risk-low/90" : ""}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={todayLitter === "no" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayLitter("no")}
                    className={todayLitter === "no" ? "bg-risk-moderate hover:bg-risk-moderate/90" : ""}
                  >
                    No
                  </Button>
                  <Button
                    variant={todayLitter === "diarrhea" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayLitter("diarrhea")}
                    className={todayLitter === "diarrhea" ? "bg-risk-high hover:bg-risk-high/90" : ""}
                  >
                    Diarrhea
                  </Button>
                </div>
              </div>

              {/* Question 3: Play */}
              <div>
                <p className="text-sm font-medium mb-2">🧶 Did {cat.name} play today?</p>
                <div className="flex gap-2">
                  <Button
                    variant={todayPlay === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayPlay(true)}
                    className={todayPlay === true ? "bg-risk-low hover:bg-risk-low/90" : ""}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={todayPlay === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTodayPlay(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Warning for consecutive no-eat days */}
              {noEatWarning && (
                <div className="bg-risk-high/20 border border-risk-high rounded-lg p-3 text-sm text-risk-high">
                  <strong>⚠️ Warning:</strong> {cat.name} hasn&apos;t eaten for 2+ days. 
                  Stress can cause appetite loss, but 48 hours is the limit. 
                  Contact the shelter or use the chat below.
                </div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSaveCheckIn}
                disabled={todayAte === null || todayLitter === null || todayPlay === null}
                className="w-full bg-sunny hover:bg-sunny/90 text-white"
              >
                Save Day {currentDay} Check-In
              </Button>
            </CardContent>
          </Card>

          {/* Visual Progress Timeline — hiding → on the bed → on the couch */}
          {checkIns.length > 0 && (
            <ProgressTimeline checkIns={checkIns} catName={cat.name} />
          )}

          {/* Current Life Card */}
          {currentLife && (
            <Card className="border-2 border-cocoa bg-white shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-sunny font-semibold uppercase tracking-wide">
                      Life {currentLife.life} of 9
                    </p>
                    <CardTitle className="text-xl text-cat-dark mt-1">
                      {currentLife.title}
                    </CardTitle>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-sunny/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-sunny">{currentLife.life}</span>
                  </div>
                </div>
                <p className="text-sm text-charcoal font-bold mt-1">{currentLife.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* The Problem */}
                <div className="bg-risk-high/5 rounded-lg p-3">
                  <p className="text-xs font-semibold text-risk-high uppercase tracking-wide mb-1">
                    The Problem
                  </p>
                  <p className="text-sm text-charcoal font-bold">{currentLife.problem}</p>
                </div>

                {/* What it teaches */}
                <div className="bg-risk-low/5 rounded-lg p-3">
                  <p className="text-xs font-semibold text-risk-low uppercase tracking-wide mb-1">
                    What to Do
                  </p>
                  <p className="text-sm text-charcoal font-bold">{currentLife.teaches}</p>
                </div>

                {/* Tips */}
                <div>
                  <p className="text-xs font-semibold text-cat-dark uppercase tracking-wide mb-2">
                    Action Steps
                  </p>
                  <ul className="space-y-2">
                    {currentLife.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-charcoal font-bold flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-sunny mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning if present */}
                {currentLife.warning && (
                  <div className="bg-risk-high/20 border border-risk-high/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-risk-high mt-0.5 shrink-0" />
                    <p className="text-sm text-risk-high">{currentLife.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: AI Chat */}
        <div className="flex flex-col">
          <SmartEscalationModal
            catName={cat.name}
            checkIns={checkIns}
            messages={messages}
            shelterId="paws-haven"
            adopterName="Adopter"
          />
          <Card className="border-2 border-cocoa bg-white flex flex-col h-[600px] shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] rounded-3xl overflow-hidden">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg text-cat-dark">
                Behavioral Support Chat
              </CardTitle>
              <p className="text-xs text-charcoal font-bold">
                Ask about {cat.name}&apos;s behavior — the AI knows their profile
              </p>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal font-bold mb-4">
                    Ask a question about {cat.name}&apos;s behavior or adjustment.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="block w-full text-left text-xs justify-start"
                      onClick={() =>
                        setInputValue(
                          `${cat.name} is hiding under the couch and won't approach me. Should I be worried?`
                        )
                      }
                    >
                      &ldquo;{cat.name} is hiding under the couch and won&apos;t approach me&rdquo;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="block w-full text-left text-xs justify-start"
                      onClick={() =>
                        setInputValue(
                          `${cat.name} is running around at 3 AM. How do I stop this?`
                        )
                      }
                    >
                      &ldquo;{cat.name} is running around at 3 AM. How do I stop this?&rdquo;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="block w-full text-left text-xs justify-start"
                      onClick={() =>
                        setInputValue(
                          `How long will it take for ${cat.name} to adjust?`
                        )
                      }
                    >
                      &ldquo;How long will it take for {cat.name} to adjust?&rdquo;
                    </Button>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="bg-sunny hover:bg-sunny/90 text-white shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Local fallback for when API is unavailable
function generateLocalFallback(
  question: string,
  catName: string,
  currentDay: number,
  checkIns: DailyCheckIn[],
  currentLife?: { title: string; problem: string; teaches: string }
): string {
  const lowerQuestion = question.toLowerCase();
  const hidingDays = checkIns.filter((c) => c.hiding).length;
  const eatingWell = checkIns.every((c) => c.ate);

  // Hiding-related questions
  if (lowerQuestion.includes("hiding") || lowerQuestion.includes("hide") || lowerQuestion.includes("won't approach") || lowerQuestion.includes("wont approach")) {
    return `I understand your concern about ${catName} hiding. This is actually covered in **Life 1: The Ghost**.\n\n` +
      `You're on Day ${currentDay}. Looking at the check-in data, ${catName} has been eating and using the litter box consistently — those are very positive signs.\n\n` +
      `**What's happening:** ${catName} is decompressing. Their brain is in survival mode, processing new scents, sounds, and territories.\n\n` +
      `**What to do:**\n` +
      `• Don't drag them out — this breaks trust\n` +
      `• Keep a quiet "safe room" with essentials nearby\n` +
      `• Sit quietly in the room and read aloud so they get used to your voice\n` +
      `• Let them initiate contact\n\n` +
      `**Timeline:** Stress-sensitive cats like ${catName} often take 1-2 weeks to feel comfortable. This is normal.`;
  }

  // Night activity / zoomies
  if (lowerQuestion.includes("3 am") || lowerQuestion.includes("night") || lowerQuestion.includes("running around") || lowerQuestion.includes("zoomies")) {
    return `Ah, the 3 AM Zoomies! This is **Life 3: The 3 AM Zoomies**.\n\n` +
      `**What's happening:** Cats are crepuscular — they're naturally most active at dawn and dusk. ${catName} isn't being "bad"; they're following their biological rhythm.\n\n` +
      `**The solution:**\n` +
      `• Play with ${catName} for 15 minutes before YOUR bedtime using a wand toy or laser pointer\n` +
      `• Feed a larger meal after play — cats naturally sleep after eating (the "hunt-eat-groom-sleep" cycle)\n` +
      `• Ignore nighttime noise — reacting teaches them it gets attention\n\n` +
      `**Why this works:** You're shifting ${catName}'s active period to align better with your schedule.`;
  }

  // Return-related questions
  if (lowerQuestion.includes("return") || lowerQuestion.includes("giving back") || lowerQuestion.includes("send back")) {
    return `It's completely normal to feel overwhelmed. The fact that you're asking questions shows how much you care.\n\n` +
      `**Before making any decisions:**\n` +
      `• ${catName} is only on Day ${currentDay} — many cats take 2+ weeks to settle\n` +
      `• The check-ins show positive signs (eating, using litter box)\n` +
      `• What you're seeing is likely normal adjustment behavior\n\n` +
      `**I recommend:** Contact the shelter to discuss your concerns. They can provide personalized guidance for ${catName}'s specific needs.\n\n` +
      `Returning a cat is always an option, but let's make sure we've explored all support available first.`;
  }

  // Timeline questions
  if (lowerQuestion.includes("how long") || lowerQuestion.includes("adjust") || lowerQuestion.includes("timeline") || lowerQuestion.includes("normal")) {
    return `Every cat adjusts at their own pace. Here's the general timeline:\n\n` +
      `**Days 1-3:** Most cats hide, may not eat much. This is **Life 1: The Ghost** phase.\n` +
      `**Days 4-7:** Gradual exploration begins, eating normalizes.\n` +
      `**Days 8-14:** More confidence, possible first playful moments.\n` +
      `**Weeks 2-4:** Settling into routine, forming bonds.\n\n` +
      `For ${catName} specifically, being a stress-sensitive cat, expect the timeline to be on the longer side — and that's perfectly okay.\n\n` +
      `**Key indicators to watch:** Eating, drinking, and using the litter box. If these are normal, your cat is progressing well.`;
  }

  // Scratching
  if (lowerQuestion.includes("scratch") || lowerQuestion.includes("furniture") || lowerQuestion.includes("couch")) {
    return `This is **Life 5: The Furniture Test**!\n\n` +
      `**What's happening:** ${catName} isn't being "bad" — scratching is a natural behavior for:\n` +
      `• Marking territory (cats have scent glands in their paws)\n` +
      `• Stretching their muscles\n` +
      `• Shedding old nail sheaths\n\n` +
      `**The solution:**\n` +
      `• Place a sisal scratching post **directly next** to the furniture they target\n` +
      `• Rub catnip or silvervine on the post to attract them\n` +
      `• Praise them when they use the post\n` +
      `• Never declaw — it's painful and can cause lasting behavior issues`;
  }

  // Default fallback
  return getCoachFallbackResponse(question, catName, currentDay);
}
