"use client";

import {
  Cat,
  Heart,
  Shield,
  Zap,
  MessageCircle,
  Sparkles,
  Users,
  Clock,
  Brain,
  ClipboardList,
  Bell,
  Star,
  ArrowRight,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/CatElements";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-coral/10 border-2 border-coral rounded-full px-4 py-2 mb-4">
          <Cat className="w-5 h-5 text-coral" />
          <span className="font-bold text-coral">About ForeverHome AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-cocoa mb-4">
          Warm, Transparent Technology
        </h1>
        <p className="text-lg text-cocoa/70 max-w-2xl mx-auto">
          Helping shelters and adopters give every cat a forever home through
          AI-powered compatibility matching and ongoing support.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-cocoa shadow-[6px_6px_0px_0px_rgba(255,107,107,1)] mb-10 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-coral" />
              Our Mission
            </h2>
            <p className="text-cocoa/70 leading-relaxed mb-4">
              ForeverHome AI is not a replacement for shelter professionals or veterinarians.
              It is a decision-support and adopter-education platform designed to:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Reduce return rates by matching cats with compatible adopters",
                "Provide structured guidance through the critical first 14 days",
                "Empower shelters with AI-powered insights",
                "Educate adopters about cat behavior and adjustment",
                "Detect potential medical emergencies early",
                "Enable direct escalation to shelter behaviorists",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-cocoa/[0.03] p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-sage/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-sage" />
                  </div>
                  <span className="text-sm text-cocoa/75 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* HOW THE SYSTEM WORKS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10"
      >
        <div className="text-center mb-8">
          <SectionTag>System Architecture</SectionTag>
          <h2 className="text-3xl font-display font-black text-cocoa mt-3">
            How ForeverHome AI Works
          </h2>
          <p className="text-cocoa/60 mt-2 max-w-xl mx-auto">
            A complete pipeline from cat discovery to lifelong support
          </p>
        </div>

        {/* Pipeline Flow */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-coral via-lavender to-sage rounded-full -translate-x-1/2 z-0" />

          {[
            {
              step: 1,
              title: "Cat Profiling & Listing",
              icon: Cat,
              color: "coral" as const,
              left: true,
              details: [
                "Shelters input detailed cat profiles including behavior traits, medical needs, and personality",
                "Each cat gets a comprehensive behavior assessment: energy level, sociability, stress sensitivity, handling tolerance",
                "Rich profiles with photos, backstory, and ideal home descriptions help adopters connect emotionally",
              ],
            },
            {
              step: 2,
              title: "Adopter Onboarding",
              icon: Users,
              color: "lavender" as const,
              left: false,
              details: [
                "Adopters complete a lifestyle questionnaire covering home type, experience level, work schedule, household noise",
                "Personality preferences and age preferences are captured for matching",
                "Role-based accounts support adopters, shelter staff, and admins",
              ],
            },
            {
              step: 3,
              title: "AI Compatibility Engine",
              icon: Brain,
              color: "cocoa" as const,
              left: true,
              details: [
                "Our scoring engine analyzes 20+ dimensions including energy match, noise tolerance, cat experience, and children compatibility",
                "AI generates a human-readable compatibility report explaining strengths, concerns, and mitigation steps",
                "Risk levels (low/moderate/high) help adopters make informed decisions",
              ],
            },
            {
              step: 4,
              title: "Assessment Quiz",
              icon: Sparkles,
              color: "honey" as const,
              left: false,
              details: [
                "5-question scenario-based assessment presents real cat behavior situations",
                "Answers feed directly into the compatibility engine for precise scoring",
                "Instant AI-generated explanation of match quality with actionable advice",
              ],
            },
            {
              step: 5,
              title: "14-Day AI Coach (9 Lives Protocol)",
              icon: MessageCircle,
              color: "coral" as const,
              left: true,
              details: [
                "Structured 9-phase program covering the most common post-adoption challenges",
                "Daily health check-ins track eating, litter box use, and play behavior",
                "AI-powered behavioral chat provides instant, personalized guidance based on the cat's profile and current adjustment phase",
                "Celebration ceremony after completing all 9 challenges",
              ],
            },
            {
              step: 6,
              title: "Smart Escalation System",
              icon: AlertTriangle,
              color: "cocoa" as const,
              left: false,
              details: [
                "One-click escalation packages daily logs and chat history into a Priority Status Report",
                "Automatic priority detection flags urgent situations (no eating, no litter use)",
                "Shelter staff receive structured reports for faster, more informed responses within 24 hours",
              ],
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: item.left ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 flex items-start gap-6 mb-10 ${
                item.left ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Step number circle on the line */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] items-center justify-center font-display font-black text-lg text-cocoa z-20">
                {item.step}
              </div>

              {/* Content card */}
              <div className={`md:w-[calc(50%-2.5rem)] ${item.left ? "md:pr-8" : "md:pl-8"}`}>
                <Card className="border-2 border-cocoa/10 hover:border-cocoa/20 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] hover:shadow-[6px_6px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-1 transition-all rounded-2xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-cocoa/10 ${
                          item.color === "coral"
                            ? "bg-coral/10"
                            : item.color === "lavender"
                            ? "bg-lavender/10"
                            : item.color === "honey"
                            ? "bg-honey/10"
                            : "bg-cocoa/10"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            item.color === "coral"
                              ? "text-coral"
                              : item.color === "lavender"
                              ? "text-lavender"
                              : item.color === "honey"
                              ? "text-honey"
                              : "text-cocoa"
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-cocoa/30 uppercase tracking-widest">
                          Step {item.step}
                        </span>
                        <h3 className="font-display font-black text-lg text-cocoa leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {item.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-cocoa/65 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-coral mt-2 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-display font-black text-cocoa mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-coral" />
          Core Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Brain,
              title: "AI Compatibility Matching",
              desc: "Analyzes cat behavior profiles and adopter lifestyles across 20+ dimensions to predict match success and identify potential challenges before adoption.",
              color: "coral" as const,
            },
            {
              icon: MessageCircle,
              title: "14-Day AI Coach",
              desc: "The 9 Lives Protocol guides adopters through the critical adjustment period with daily check-ins, behavioral tips, and personalized AI coaching.",
              color: "lavender" as const,
            },
            {
              icon: Shield,
              title: "Medical Emergency Detection",
              desc: "Keyword-based detection flags urgent phrases like 'trouble breathing' or 'seizure' and immediately directs adopters to emergency veterinary care.",
              color: "sage" as const,
            },
            {
              icon: Bell,
              title: "Smart Escalation Tickets",
              desc: "One-click escalation packages daily health logs and AI chat history into Priority Status Reports sent to shelter behaviorists for review.",
              color: "honey" as const,
            },
            {
              icon: ClipboardList,
              title: "Daily Health Check-Ins",
              desc: "Track eating, litter box usage, and play behavior daily. Automatic warnings for 2+ days without eating or concerning patterns.",
              color: "cocoa" as const,
            },
            {
              icon: Star,
              title: "Adopter Reviews",
              desc: "Verified adopter reviews on shelter profiles with adoption stories, ratings, and the cat they adopted — building trust for future adopters.",
              color: "coral" as const,
            },
            {
              icon: Users,
              title: "Shelter Dashboards",
              desc: "Dedicated shelter staff tools for managing cat listings, tracking adoptions, viewing insights, and responding to escalation reports.",
              color: "lavender" as const,
            },
            {
              icon: Clock,
              title: "Ongoing Support",
              desc: "Beyond the 14-day program, the AI coach remains available for behavioral questions, ensuring lifelong support for adopters and cats.",
              color: "sage" as const,
            },
            {
              icon: Zap,
              title: "Offline-Ready Fallback",
              desc: "When the AI is unavailable, a comprehensive local fallback system provides knowledgeable responses using pre-built behavioral templates.",
              color: "honey" as const,
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 border-2 border-cocoa/10 hover:border-cocoa/20 shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] hover:shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] transition-all"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border-2 border-cocoa/10 ${
                  feature.color === "coral"
                    ? "bg-coral/10"
                    : feature.color === "lavender"
                    ? "bg-lavender/10"
                    : feature.color === "sage"
                    ? "bg-sage/10"
                    : feature.color === "honey"
                    ? "bg-honey/10"
                    : "bg-cocoa/5"
                }`}
              >
                <feature.icon
                  className={`w-5 h-5 ${
                    feature.color === "coral"
                      ? "text-coral"
                      : feature.color === "lavender"
                      ? "text-lavender"
                      : feature.color === "sage"
                      ? "text-sage"
                      : feature.color === "honey"
                      ? "text-honey"
                      : "text-cocoa"
                  }`}
                />
              </div>
              <h3 className="font-display font-black text-base text-cocoa mb-1.5">{feature.title}</h3>
              <p className="text-sm text-cocoa/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-2 border-cocoa/10 bg-gradient-to-br from-cocoa/[0.02] to-cocoa/[0.05] mb-10 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-lavender" />
              AI Technology Stack
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Model Chain",
                  items: [
                    "Gemini 3.5 Flash (primary)",
                    "Gemini 3 Flash Preview (fallback)",
                    "Gemini 2.5 Flash (last resort)",
                    "Local fallback templates",
                  ],
                },
                {
                  title: "Safety Layers",
                  items: [
                    "Medical emergency keyword detection",
                    "Mandatory disclaimers on all AI responses",
                    "Rate limiting on API calls",
                    "Profile validation before AI access",
                  ],
                },
                {
                  title: "Data Pipeline",
                  items: [
                    "Adopter profile → AI context",
                    "Cat behavior profile → AI context",
                    "Daily check-in history → AI context",
                    "Escalation packaging for shelter staff",
                  ],
                },
              ].map((block) => (
                <div key={block.title} className="bg-white rounded-2xl p-5 border border-cocoa/10">
                  <h4 className="font-display font-black text-sm text-cocoa mb-3">{block.title}</h4>
                  <ul className="space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-cocoa/60">
                        <Check className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* The 9 Lives Protocol */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-cocoa/10 bg-cocoa/[0.02] mb-10 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-honey" />
              The 9 Lives Protocol
            </h2>
            <p className="text-cocoa/70 mb-6 leading-relaxed">
              Just like cats are said to have 9 lives, new adoptions face 9 common challenges
              in the first days. Each &ldquo;Life&rdquo; you survive together builds trust and strengthens
              your bond. You don&apos;t lose lives — you earn them! The protocol is a structured
              14-day program with a core 9-day curriculum followed by Maintenance Mode for
              continued support.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { life: 1, title: "The Ghost", desc: "Decompression & hiding — letting your cat adjust at their own pace", days: "Days 1-2" },
                { life: 2, title: "The Explorer", desc: "First explorations — curiosity emerges as fear recedes", days: "Days 2-3" },
                { life: 3, title: "3 AM Zoomies", desc: "Night activity norms — managing crepuscular energy cycles", days: "Days 3-4" },
                { life: 4, title: "The First Meal", desc: "Eating regularly — appetite as a key health indicator", days: "Days 4-5" },
                { life: 5, title: "Furniture Test", desc: "Scratching behaviors — redirecting natural instincts", days: "Days 5-6" },
                { life: 6, title: "The Litter Box", desc: "Bathroom habits — ensuring consistent litter box use", days: "Days 6-7" },
                { life: 7, title: "Playtime", desc: "Interactive bonding — building trust through play", days: "Days 7-8" },
                { life: 8, title: "The Routine", desc: "Schedule settling — establishing predictable daily patterns", days: "Days 8-9" },
                { life: 9, title: "Home", desc: "Fully adjusted — your cat has found their forever rhythm", days: "Days 9-14" },
              ].map((item) => (
                <div
                  key={item.life}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-cocoa/10 hover:border-coral/20 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-coral/10 flex items-center justify-center text-coral font-black text-sm shrink-0 border border-coral/20">
                    {item.life}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-cocoa text-sm">{item.title}</p>
                      <span className="text-[10px] text-cocoa/30 font-medium">{item.days}</span>
                    </div>
                    <p className="text-xs text-cocoa/50 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-2 border-cocoa/10 bg-sage/[0.03] mb-10 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-sage" />
              Privacy & Security
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Firestore security rules with user-level access control",
                "Adopter profiles readable only by the profile owner",
                "Assessment results visible only to the adopter",
                "AI logs are write-only for users, read-only for admins",
                "API routes validate adopter profile ID before AI access",
                "Medical emergency detection runs locally — never sent to AI",
                "All AI responses include disclaimers about non-veterinary nature",
                "Cat listings are publicly readable; writable only by shelter staff",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-sage/20">
                  <div className="w-5 h-5 rounded-md bg-sage/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-sage" />
                  </div>
                  <span className="text-sm text-cocoa/70 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-coral/5 border-2 border-coral/20 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-5 h-5 text-coral mx-auto mb-2" />
          <p className="text-sm text-cocoa/70">
            <strong className="text-cocoa">Important:</strong> ForeverHome AI is not a replacement for shelter
            professionals or veterinarians. It is a decision-support and adopter-education platform.
            All adoption decisions should be made in consultation with qualified shelter staff.
          </p>
        </div>
      </motion.div>

      {/* Stats + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-12 text-center"
      >
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {[
            { value: "500+", label: "Cats Adopted", icon: Cat },
            { value: "98%", label: "Match Rate", icon: Heart },
            { value: "14 Days", label: "Support Period", icon: Clock },
            { value: "24/7", label: "AI Coach", icon: MessageCircle },
            { value: "0.3%", label: "Return Rate", icon: Shield },
            { value: "4.9", label: "Avg Rating", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-cocoa shadow-[3px_3px_0px_0px_rgba(42,29,20,1)] flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-7 h-7 text-coral" />
              </div>
              <p className="text-2xl font-display font-black text-cocoa">{stat.value}</p>
              <p className="text-xs text-cocoa/50 font-bold uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <Link href="/cats">
          <Button className="bg-coral hover:bg-coral-deep text-white px-8 py-3 rounded-full font-bold shadow-[5px_5px_0px_0px_rgba(42,29,20,1)] hover:shadow-[7px_7px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 transition-all" size="lg">
            <Cat className="w-5 h-5 mr-2" />
            Start Your Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
