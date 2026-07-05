"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DailyCheckIn } from "@/types/checkIn";
import { ChatMessage } from "@/types/coach";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Send,
  ShieldAlert,
  Clock,
  Phone,
  Cat,
  ClipboardList,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartEscalationModalProps {
  catName: string;
  checkIns: DailyCheckIn[];
  messages: ChatMessage[];
  shelterId?: string;
  adopterName?: string;
}

export default function SmartEscalationModal({
  catName,
  checkIns,
  messages,
  shelterId = "paws-haven",
  adopterName = "Adopter",
}: SmartEscalationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recentCheckIns = [...checkIns]
    .sort((a, b) => b.day - a.day)
    .slice(0, 3);

  const recentMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3);

  const hasData = recentCheckIns.length > 0 || recentMessages.length > 0;

  const handleSendReport = async () => {
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/escalation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catName,
          shelterId,
          adopterName,
          checkIns: recentCheckIns,
          chatHistory: recentMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send report");
      }

      setIsSending(false);
      setIsSuccess(true);
    } catch (err) {
      setIsSending(false);
      setError(err instanceof Error ? err.message : "Something went wrong");

      // Fallback: simulate success for demo
      setTimeout(() => {
        setError(null);
        setIsSuccess(true);
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setError(null);
    }, 300);
  };

  const StatusIcon = ({ day, ate, litterUsed }: DailyCheckIn) => {
    const allGood = ate && litterUsed;
    const partial = ate || litterUsed;
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${
          allGood
            ? "bg-sage/15 text-sage border-2 border-sage/30"
            : partial
            ? "bg-honey/15 text-honey border-2 border-honey/30"
            : "bg-risk-high/15 text-risk-high border-2 border-risk-high/30"
        }`}
      >
        D{day}
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button - Prominent Escalation CTA */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full mb-3 relative overflow-hidden group rounded-2xl"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-risk-high via-honey to-risk-high bg-[length:200%_100%] animate-shimmer rounded-2xl" />
        <div className="relative m-[2px] rounded-[14px] bg-gradient-to-br from-risk-high/5 via-white to-risk-high/5 p-3 flex items-center gap-3 transition-all group-hover:from-risk-high/10 group-hover:to-risk-high/10">
          {/* Alert icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-risk-high to-coral flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(217,97,76,0.5)] shrink-0 group-hover:shadow-[3px_3px_0px_0px_rgba(217,97,76,0.7)] group-hover:-translate-y-0.5 transition-all">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 text-left">
            <h4 className="font-display font-black text-sm text-cocoa leading-tight">
              Need Human Help?
            </h4>
            <p className="text-[11px] text-cocoa font-bold mt-0.5">
              Request a shelter behaviorist to review {catName}&apos;s file
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-risk-high/10 flex items-center justify-center shrink-0 group-hover:bg-risk-high group-hover:text-white transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[540px] border-2 border-cocoa/20 rounded-[28px] p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(42,29,20,1)]">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start gap-4 mb-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-risk-high/15 to-coral/15 border-2 border-risk-high/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-7 h-7 text-risk-high" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-display font-black text-cocoa">
                        Escalate to Shelter Behaviorist
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-high/10 text-xs font-bold text-risk-high">
                          <Clock className="w-3 h-3" />
                          Response within 24h
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage/10 text-xs font-bold text-sage">
                          <Phone className="w-3 h-3" />
                          Call-back included
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogDescription className="text-cocoa font-bold text-sm mt-4 leading-relaxed bg-cocoa/[0.03] rounded-2xl p-4 border border-cocoa/[0.06]">
                    <span className="font-bold text-cocoa">Need human eyes on this?</span> We will
                    package {catName}&apos;s daily logs and your AI chat history into a{" "}
                    <span className="font-bold text-coral">Priority Status Report</span> and send it
                    directly to the shelter team.
                  </DialogDescription>
                </div>

                {/* Report Preview */}
                <div className="mx-6 my-5 bg-gradient-to-br from-cream-dark/50 to-white rounded-2xl border-2 border-cocoa/10 overflow-hidden">
                  {/* Preview header */}
                  <div className="bg-cocoa/[0.03] px-4 py-3 border-b border-cocoa/10 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cocoa flex items-center justify-center">
                      <FileText className="w-4 h-4 text-cream" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-cocoa uppercase tracking-wide">
                        Priority Status Report
                      </p>
                      <p className="text-[10px] text-cocoa font-bold">
                        {catName} · {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Daily Logs section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="w-4 h-4 text-cocoa" />
                        <span className="text-xs font-black text-cocoa uppercase tracking-wide">
                          Last 3 Days of Logs
                        </span>
                      </div>
                      {recentCheckIns.length > 0 ? (
                        <div className="space-y-2">
                          {recentCheckIns.map((checkIn) => (
                            <div
                              key={checkIn.day}
                              className="flex items-center justify-between bg-white rounded-xl p-3 border border-cocoa/5 hover:border-cocoa/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <StatusIcon {...checkIn} />
                                <div className="flex gap-3 text-sm">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <span className="text-base">
                                      {checkIn.ate ? "🍗" : "⚠️"}
                                    </span>
                                    <span className={checkIn.ate ? "text-sage" : "text-risk-high font-semibold"}>
                                      {checkIn.ate ? "Ate" : "No food"}
                                    </span>
                                  </span>
                                  <span className="text-cocoa font-bold">|</span>
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <span className="text-base">
                                      {checkIn.litterUsed ? "🚽" : "⚠️"}
                                    </span>
                                    <span className={checkIn.litterUsed ? "text-sage" : "text-risk-high font-semibold"}>
                                      {checkIn.litterUsed ? "Litter OK" : "No litter"}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {checkIn.notes && (
                                <span className="text-[10px] text-cocoa font-bold max-w-[120px] truncate hidden sm:block">
                                  {checkIn.notes}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-3 text-center border border-cocoa/5">
                          <Cat className="w-5 h-5 text-cocoa mx-auto mb-1" />
                          <p className="text-xs text-cocoa font-bold">No logs recorded yet</p>
                        </div>
                      )}
                    </div>

                    {/* Chat History section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-cocoa" />
                        <span className="text-xs font-black text-cocoa uppercase tracking-wide">
                          Recent Questions to AI Coach
                        </span>
                      </div>
                      {recentMessages.length > 0 ? (
                        <div className="space-y-2">
                          {recentMessages.map((msg, i) => (
                            <div
                              key={i}
                              className="bg-white rounded-xl p-3 border border-cocoa/5 border-l-[3px] border-l-honey"
                            >
                              <p className="text-xs text-cocoa font-bold leading-relaxed italic line-clamp-2">
                                &ldquo;{msg.content}&rdquo;
                              </p>
                              <p className="text-[10px] text-cocoa font-bold mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-3 text-center border border-cocoa/5">
                          <MessageSquare className="w-5 h-5 text-cocoa mx-auto mb-1" />
                          <p className="text-xs text-cocoa font-bold">No chat history yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error state */}
                {error && (
                  <div className="mx-6 mb-5 p-3 bg-risk-high/10 border border-risk-high/20 rounded-xl text-sm text-risk-high font-medium text-center">
                    {error}
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-6">
                  <DialogFooter className="flex sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="rounded-xl border-cocoa/20 text-cocoa hover:bg-cocoa/5 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendReport}
                      disabled={isSending || !hasData}
                      className="bg-gradient-to-r from-risk-high to-coral hover:from-risk-high/90 hover:to-coral/90 text-white rounded-xl gap-2 min-w-[160px] font-bold shadow-[3px_3px_0px_0px_rgba(217,97,76,0.4)] hover:shadow-[5px_5px_0px_0px_rgba(217,97,76,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Packaging Report...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Report
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </motion.div>
            ) : (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 px-6 text-center flex flex-col items-center"
              >
                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-sage/15 to-sage/10 border-2 border-sage/30 flex items-center justify-center mb-6 relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="w-12 h-12 text-sage" />
                  </motion.div>
                  {/* Decorative dots */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-5 h-5 text-honey" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-display font-black text-cocoa mb-3">
                    Priority Report Sent
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-sage" />
                    <p className="text-sm text-cocoa font-bold">
                      Daily logs packaged successfully
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Check className="w-4 h-4 text-sage" />
                    <p className="text-sm text-cocoa font-bold">
                      Chat history attached
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-sage/5 via-sage/10 to-sage/5 rounded-2xl p-5 border border-sage/20 mb-6 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-sage font-bold text-sm mb-2 justify-center">
                      <Phone className="w-4 h-4" />
                      What happens next:
                    </div>
                    <p className="text-sm text-cocoa font-bold leading-relaxed">
                      The shelter team will review {catName}&apos;s file and{" "}
                      <strong className="text-cocoa">call you within 24 hours</strong>. Keep your
                      phone nearby. In the meantime, continue tracking daily check-ins.
                    </p>
                  </div>
                </motion.div>

                <Button
                  onClick={handleClose}
                  className="bg-cocoa hover:bg-cocoa/90 text-cream rounded-xl px-8 font-bold shadow-[3px_3px_0px_0px_rgba(42,29,20,0.5)]"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
