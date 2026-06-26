"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatById } from "@/data/demoCats";
import { demoCheckIns } from "@/data/demoCheckIns";
import { dailyGuidance } from "@/data/dailyGuidance";
import { isMedicalEmergency } from "@/lib/medicalEscalation";
import { getCoachFallbackResponse } from "@/lib/fallbackExplanations";
import { DailyCheckIn } from "@/types/checkIn";
import { ChatMessage } from "@/types/coach";
import DailyCheckInComponent from "@/components/coach/DailyCheckIn";
import ProgressTimeline from "@/components/coach/ProgressTimeline";
import ChatBubble from "@/components/coach/ChatBubble";
import MedicalEscalation from "@/components/coach/MedicalEscalation";
import EmergencyContacts from "@/components/coach/EmergencyContacts";
import { Send, AlertCircle } from "lucide-react";

export default function CoachPage() {
  const params = useParams();
  const adoptionId = params.adoptionId as string;

  const cat = getCatById("barnaby");
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(demoCheckIns);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentDay = checkIns.length > 0 ? Math.max(...checkIns.map((c) => c.day)) + 1 : 1;
  const todayGuidance = dailyGuidance.find((g) => g.day === Math.min(currentDay, 14));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSaveCheckIn = (
    checkInData: Omit<DailyCheckIn, "adoptionId" | "timestamp">
  ) => {
    const newCheckIn: DailyCheckIn = {
      ...checkInData,
      adoptionId,
      timestamp: new Date().toISOString(),
    };
    setCheckIns((prev) => [...prev, newCheckIn]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Check for medical emergency
    if (isMedicalEmergency(inputValue)) {
      setShowEmergency(true);
      const emergencyMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "system",
        content: "Medical emergency detected. Showing emergency contacts.",
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

    // Generate context-aware fallback response
    const responseContent = generateCoachResponse(
      inputValue,
      cat?.name || "the cat",
      currentDay,
      checkIns
    );

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!cat) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cat-dark">
          First 14 Days Coach
        </h1>
        <p className="text-charcoal/50 mt-1">
          Supporting you and {cat.name} through the transition
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-warm-cream rounded-lg p-3 border border-border mb-6 flex items-center gap-2 text-sm text-charcoal/50">
        <AlertCircle className="h-4 w-4 shrink-0 text-heart" />
        <p>
          This coach provides general behavioral guidance, not veterinary advice.
          For medical concerns, contact your veterinarian immediately.
        </p>
      </div>

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
        {/* Left Column: Check-in + Timeline */}
        <div className="space-y-6">
          <DailyCheckInComponent
            day={currentDay}
            catName={cat.name}
            onSave={handleSaveCheckIn}
          />
          <ProgressTimeline checkIns={checkIns} catName={cat.name} />

          {/* Today's Guidance */}
          {todayGuidance && (
            <Card className="border-border bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-cat-dark">
                  Day {todayGuidance.day}: {todayGuidance.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-charcoal/50 mb-3">
                  {todayGuidance.content}
                </p>
                <ul className="space-y-1">
                  {todayGuidance.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-cat-dark mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Chat */}
        <div className="flex flex-col">
          <Card className="border-border bg-white flex flex-col h-[600px]">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg text-cat-dark">
                Behavioral Support Chat
              </CardTitle>
              <p className="text-xs text-charcoal/50">
                Day {currentDay} of transition · Ask about {cat.name}&apos;s behavior
              </p>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal/50">
                    Ask a question about {cat.name}&apos;s behavior or adjustment.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="block w-full text-left text-xs"
                      onClick={() =>
                        setInputValue(
                          `${cat.name} is hiding under the couch and won't approach me. Should I return him?`
                        )
                      }
                    >
                      &quot;{cat.name} is hiding under the couch and won&apos;t approach me&quot;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="block w-full text-left text-xs"
                      onClick={() =>
                        setInputValue(
                          `How long does it take for a cat to adjust?`
                        )
                      }
                    >
                      How long does it take for a cat to adjust?
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

function generateCoachResponse(
  question: string,
  catName: string,
  currentDay: number,
  checkIns: DailyCheckIn[]
): string {
  const lowerQuestion = question.toLowerCase();
  const recentCheckIns = checkIns.slice(-3);
  const hidingDays = checkIns.filter((c) => c.hiding).length;
  const eatingWell = checkIns.every((c) => c.ate);
  const usingLitter = checkIns.every((c) => c.litterUsed);

  if (lowerQuestion.includes("hiding") || lowerQuestion.includes("hide") || lowerQuestion.includes("won't approach") || lowerQuestion.includes("wont approach")) {
    return `I understand your concern about ${catName} hiding. Looking at the check-in data:\n\n` +
      `You're on Day ${currentDay}. ${catName} has been hiding on ${hidingDays} of the logged days, but has been eating and using the litter box consistently — those are very positive signs.\n\n` +
      `Hiding is a completely normal behavior for stress-sensitive cats in a new environment. Many cats take 1-2 weeks to feel comfortable enough to explore.\n\n` +
      `Here's what you can do:\n` +
      `• Keep a quiet room with essentials nearby\n` +
      `• Sit quietly in the room — let ${catName} come to you\n` +
      `• Offer treats from a distance\n` +
      `• Avoid forcing interaction\n\n` +
      `If ${catName} stops eating for 2+ days or shows other concerning changes, contact the shelter for guidance.`;
  }

  if (lowerQuestion.includes("return") || lowerQuestion.includes("giving back") || lowerQuestion.includes("send back")) {
    return `It's completely normal to feel overwhelmed during the transition period. The fact that you're asking questions shows how much you care.\n\n` +
      `Before making any decisions, consider:\n` +
      `• ${catName} is only on Day ${currentDay} — many cats take 2+ weeks to settle\n` +
      `• The check-ins show positive signs (eating, using litter box)\n` +
      `• What you're seeing may be normal adjustment behavior\n\n` +
      `I'd recommend contacting the shelter to discuss your concerns. They can provide personalized guidance and may have suggestions specific to ${catName}. Returning a cat is always an option, but let's make sure we've explored all the support available first.`;
  }

  if (lowerQuestion.includes("how long") || lowerQuestion.includes("adjust") || lowerQuestion.includes("normal")) {
    return `Every cat adjusts at their own pace, but here's a general guide:\n\n` +
      `• Days 1-3: Most cats hide, may not eat much, and stay close to their safe space\n` +
      `• Days 4-7: Gradual exploration begins, eating and litter habits normalize\n` +
      `• Days 8-14: More confidence, possible first playful moments\n` +
      `• Weeks 2-4: Settling into routine, forming bonds\n\n` +
      `For ${catName} specifically, the check-ins show steady progress. Stress-sensitive cats often take a bit longer, and that's perfectly okay. The key indicators — eating, drinking, and using the litter box — are all positive.\n\n` +
      `If you have concerns about the pace of adjustment, the shelter can provide guidance tailored to ${catName}'s history.`;
  }

  // Default fallback
  return getCoachFallbackResponse(question, catName, currentDay);
}
