"use client";

import { Shield, Lock, Eye, Database, Mail, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/CatElements";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-lavender/10 border-2 border-lavender rounded-full px-4 py-2 mb-4">
          <Shield className="w-5 h-5 text-lavender" />
          <span className="font-bold text-lavender">Privacy Policy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-cocoa mb-4">
          Your Data, Your Trust
        </h1>
        <p className="text-lg text-cocoa/70 max-w-2xl mx-auto">
          We take your privacy seriously. Here&apos;s how we handle your data with care and transparency.
        </p>
      </motion.div>

      {/* What We Collect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] mb-8 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-coral" />
              What We Collect
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Profile Information",
                  desc: "Name, email, home type, lifestyle preferences, and pet experience — used to match you with compatible cats.",
                },
                {
                  title: "Assessment Answers",
                  desc: "Scenario-based quiz responses that feed into our compatibility engine. Only you can see your results.",
                },
                {
                  title: "AI Coach Conversations",
                  desc: "Messages you exchange with the AI coach are stored to provide continuity in your adoption journey.",
                },
                {
                  title: "Daily Health Check-Ins",
                  desc: "Eating, litter box, and play behavior logs to help monitor your cat's adjustment period.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-cocoa/[0.02] rounded-xl border border-cocoa/5">
                  <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-coral font-black text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-cocoa text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-cocoa/60 leading-relaxed">{item.desc}</p>
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
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] mb-8 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-sage" />
              How We Protect Your Data
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Firestore security rules enforce user-level access control",
                "Adopter profiles readable only by the profile owner",
                "Assessment results visible only to you",
                "AI chat logs are write-only for users, read-only for admins",
                "API routes validate adopter profile ID before AI access",
                "Medical emergency detection runs locally — never sent to AI",
                "All AI responses include mandatory disclaimers",
                "No data is sold or shared with third parties",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-sage/[0.03] rounded-xl border border-sage/10">
                  <div className="w-5 h-5 rounded-md bg-sage/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-sage" />
                  </div>
                  <span className="text-sm text-cocoa/70 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Rights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-cocoa/10 shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] mb-8 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-display font-black text-cocoa mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-honey" />
              Your Rights
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Access", desc: "Request a copy of all data we hold about you at any time." },
                { title: "Correction", desc: "Update or correct your profile information through your account settings." },
                { title: "Deletion", desc: "Request deletion of your account and all associated data." },
                { title: "Portability", desc: "Export your data in a machine-readable format upon request." },
                { title: "Opt-Out", desc: "You can delete your account at any time — no questions asked." },
                { title: "Transparency", desc: "We notify you of any significant changes to this privacy policy." },
              ].map((item) => (
                <div key={item.title} className="p-3 bg-honey/[0.03] rounded-xl border border-honey/10">
                  <h3 className="font-bold text-cocoa text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-cocoa/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="bg-cocoa/[0.02] border-2 border-cocoa/10 rounded-3xl p-8 mb-8">
          <Mail className="w-8 h-8 text-coral mx-auto mb-3" />
          <h3 className="font-display font-black text-xl text-cocoa mb-2">Questions About Privacy?</h3>
          <p className="text-sm text-cocoa/60 mb-4">
            We&apos;re happy to answer any questions about how we handle your data.
          </p>
          <Link href="mailto:privacy@foreverhome.ai">
            <Button variant="outline" className="border-2 border-cocoa/20 rounded-full font-bold text-cocoa hover:bg-cocoa/5">
              <Mail className="w-4 h-4 mr-2" />
              privacy@foreverhome.ai
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-cocoa/40">
          <AlertTriangle className="w-4 h-4" />
          <span>Last updated: July 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
