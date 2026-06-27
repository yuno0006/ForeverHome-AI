import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, MessageCircle, Sparkles, Search, AlertTriangle, Users } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-sunny/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-heart/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo - no container, bigger */}
            <div className="flex justify-center mb-6">
              <Image
                src="/cat.png"
                alt="ForeverHome AI"
                width={96}
                height={96}
                className="w-24 h-24 object-contain"
                priority
              />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cat-dark tracking-tight">
              Every cat deserves a{" "}
              <span className="relative inline-flex items-center gap-2">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-heart fill-heart animate-pulse" />
                <span className="text-heart">forever home</span>
              </span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
              We help shelters find the perfect match the first time &mdash; and support
              adopters through the critical first 14 days so cats stay home for good.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-sunny hover:bg-sunny/90 text-cat-dark text-base px-8 py-6 rounded-2xl shadow-lg shadow-sunny/20 font-semibold cursor-pointer"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Shelter Dashboard
                </Button>
              </Link>
              <Link href="/cats">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-2xl border-2 border-sunny/30 text-cat-dark hover:bg-sunny-light font-semibold cursor-pointer"
                >
                  <Heart className="h-5 w-5 mr-2 text-heart" />
                  Try the Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-sunny-light text-cat-dark text-sm font-medium rounded-full mb-3">
              How it works
            </span>
            <h2 className="text-3xl font-bold text-cat-dark">
              Three steps to a happy adoption
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: "bg-sunny/15 text-sunny",
                title: "Smart Matching",
                desc: "Our rules engine compares each cat\u2019s personality with an adopter\u2019s lifestyle \u2014 no black boxes, just transparent, caring guidance.",
              },
              {
                icon: Heart,
                color: "bg-heart-light text-heart",
                title: "14-Day Coach",
                desc: "After adoption, our AI coach helps adopters understand normal adjustment behaviors with daily check-ins and gentle support.",
              },
              {
                icon: MessageCircle,
                color: "bg-sunny/15 text-sunny",
                title: "Progress Tracking",
                desc: "Daily check-ins build a visual timeline showing how each cat is adjusting \u2014 giving shelters visibility without the phone calls.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-sunny/15 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl"
              >
                <CardContent className="pt-6">
                  <div className={`${item.color} rounded-2xl p-3 w-fit mb-4`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-cat-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-charcoal/60 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-heart-light text-heart text-sm font-medium rounded-full mb-3">
              Our promise
            </span>
            <h2 className="text-3xl font-bold text-cat-dark">
              Built with love for cats
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              {
                icon: Search,
                title: "Transparent rules",
                desc: "Every assessment shows exactly which rules were triggered and why.",
              },
              {
                icon: AlertTriangle,
                title: "Safety first",
                desc: "Medical concerns are immediately escalated. AI never provides veterinary advice.",
              },
              {
                icon: Heart,
                title: "Compassionate language",
                desc: "High risk doesn\u2019t mean a bad adopter. Results are explained without judgment.",
              },
              {
                icon: Users,
                title: "Human decisions",
                desc: "Shelter staff always make the final call. ForeverHome is a support tool, not a replacement.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-warm-cream rounded-2xl border border-sunny/15"
              >
                <div className="p-2 bg-sunny/10 rounded-xl shrink-0">
                  <item.icon className="h-5 w-5 text-sunny" />
                </div>
                <div>
                  <p className="font-semibold text-cat-dark text-sm">{item.title}</p>
                  <p className="text-xs text-charcoal/60 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sunny py-16 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl font-extrabold text-cat-dark mb-3">
            See it in action
          </h2>
          <p className="text-cat-dark/70 mb-8 text-lg">
            Walk through a complete demo: from compatibility assessment to daily
            check-ins to AI-powered coaching.
          </p>
          <Link href="/cats">
            <Button
              size="lg"
              className="bg-cat-dark hover:bg-cat-dark/90 text-sunny text-lg px-10 py-6 rounded-2xl shadow-lg font-semibold cursor-pointer"
            >
              Start the Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}