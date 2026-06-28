import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Brain,
  HeartHandshake,
  LineChart,
  Check,
  Search,
  ShieldCheck,
  MessageCircleHeart,
  Users,
  Cat,
  ArrowRight,
  PawPrint,
  Home,
} from "lucide-react";

function Paw({ className = "" }: { className?: string }) {
  return <PawPrint className={className} aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Soft gradient blobs */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-secondary blur-3xl" />

        {/* Faint scattered paws */}
        <Paw className="pointer-events-none absolute left-[8%] top-[22%] h-10 w-10 -rotate-12 text-primary/10" />
        <Paw className="pointer-events-none absolute right-[12%] top-[30%] h-8 w-8 rotate-12 text-accent/15" />
        <Paw className="pointer-events-none absolute left-[18%] bottom-[12%] h-7 w-7 rotate-6 text-primary/10" />
        <Paw className="pointer-events-none absolute right-[22%] bottom-[18%] h-9 w-9 -rotate-6 text-accent/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-3xl bg-card p-4 shadow-md ring-1 ring-border">
                <Image
                  src="/cat.png"
                  alt="ForeverHome AI"
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] object-contain"
                  priority
                />
              </div>
            </div>

            {/* AI pill badge */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-secondary-foreground ring-1 ring-primary/15">
                <Sparkles className="h-4 w-4" />
                Powered by AI
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-cat-dark sm:text-5xl lg:text-6xl">
              Every cat deserves a{" "}
              <span className="text-primary">forever home</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              ForeverHome AI helps shelters find the right match the first time
              &mdash; then supports adopters through the critical first 14 days so
              cats stay home for good.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cats">
                <Button
                  size="lg"
                  className="w-full cursor-pointer rounded-2xl bg-primary px-8 py-6 text-base font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg sm:w-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Find Your Match
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full cursor-pointer rounded-2xl border-2 border-primary/25 bg-card px-8 py-6 text-base font-bold text-cat-dark transition-all hover:-translate-y-0.5 hover:bg-secondary sm:w-auto"
                >
                  <Home className="mr-2 h-5 w-5 text-primary" />
                  I&apos;m a Shelter
                </Button>
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Transparent AI
              </span>
              <span className="text-border">&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-primary" />
                14-Day Coach
              </span>
              <span className="text-border">&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                <Cat className="h-4 w-4 text-accent" />
                Shelter-loved
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-secondary-foreground">
              How it works
            </span>
            <h2 className="text-3xl font-extrabold text-cat-dark sm:text-4xl">
              Three steps to a happy adoption
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Brain,
                badge: "bg-secondary text-primary",
                title: "Smart Matching",
                desc: "Our AI compares each cat\u2019s personality with an adopter\u2019s lifestyle \u2014 no black boxes, just transparent, caring guidance.",
              },
              {
                icon: HeartHandshake,
                badge: "bg-[#E9F1ED] text-accent",
                title: "14-Day Coach",
                desc: "After adoption, the AI coach helps adopters understand normal adjustment behaviors with daily check-ins and gentle support.",
              },
              {
                icon: LineChart,
                badge: "bg-secondary text-primary",
                title: "Progress Tracking",
                desc: "Daily check-ins build a visual timeline showing how each cat is settling in \u2014 giving shelters visibility without the phone calls.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="group rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <CardContent className="p-7">
                  <div
                    className={`${item.badge} mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-cat-dark">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOR SHELTERS & ADOPTERS ============ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-secondary-foreground">
              Built for both sides
            </span>
            <h2 className="text-3xl font-extrabold text-cat-dark sm:text-4xl">
              Value for everyone in the journey
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* For Adopters */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-secondary/60 p-8 sm:p-10">
              <Paw className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rotate-12 text-primary/10" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-cat-dark">
                  For Adopters
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Find a cat that genuinely fits your home and lifestyle",
                  "Understand what to expect in the first two weeks",
                  "Daily AI coaching that reduces stress for you and your cat",
                  "Honest, judgment-free guidance every step of the way",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-cat-dark/80">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Shelters */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-[#EDF3F0] p-8 sm:p-10">
              <Paw className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rotate-12 text-accent/15" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-cat-dark">
                  For Shelters
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Spot compatibility concerns before the adoption happens",
                  "Reduce returns with better-matched placements",
                  "See how each cat is adjusting without chasing phone calls",
                  "Keep staff in control \u2014 AI supports, humans decide",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-cat-dark/80">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST / PROMISE BAND ============ */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-card px-4 py-1.5 text-sm font-bold text-primary ring-1 ring-primary/15">
              Our promise
            </span>
            <h2 className="text-3xl font-extrabold text-cat-dark sm:text-4xl">
              Built with love, designed with care
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Search,
                title: "Transparent rules",
                desc: "Every assessment shows exactly which rules were triggered and why.",
              },
              {
                icon: ShieldCheck,
                title: "Safety first",
                desc: "Medical concerns are escalated. AI never provides veterinary advice.",
              },
              {
                icon: MessageCircleHeart,
                title: "Compassionate language",
                desc: "High risk doesn\u2019t mean a bad adopter. Results are explained without judgment.",
              },
              {
                icon: Users,
                title: "Human decisions",
                desc: "Shelter staff always make the final call. ForeverHome is a support tool.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="mb-1.5 text-base font-bold text-cat-dark">
                  {item.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BIG CTA ============ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[#D9614C] px-6 py-16 text-center shadow-lg sm:px-12 sm:py-20">
          {/* Paw motifs */}
          <Paw className="pointer-events-none absolute left-8 top-8 h-12 w-12 -rotate-12 text-white/15" />
          <Paw className="pointer-events-none absolute right-10 top-16 h-8 w-8 rotate-12 text-white/15" />
          <Paw className="pointer-events-none absolute bottom-8 left-1/4 h-10 w-10 rotate-6 text-white/10" />
          <Paw className="pointer-events-none absolute bottom-12 right-12 h-14 w-14 -rotate-6 text-white/10" />

          <div className="relative">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                <Cat className="h-4 w-4" />
                Ready when you are
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Ready to find your purrfect match?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
              Browse adoptable cats, run a transparent compatibility check, and meet
              your AI coach for the first 14 days.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cats">
                <Button
                  size="lg"
                  className="w-full cursor-pointer rounded-2xl bg-card px-10 py-6 text-base font-bold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg sm:w-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Find Your Match
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full cursor-pointer rounded-2xl border-2 border-white/60 bg-transparent px-10 py-6 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
                >
                  <Home className="mr-2 h-5 w-5" />
                  I&apos;m a Shelter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
