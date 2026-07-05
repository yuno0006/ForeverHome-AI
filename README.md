# 🐾 ForeverHome AI

> **Built for [#hackthekitty](https://hackthekitty.com/) — World Cat Domination Day Hackathon 2026**

**Preventing cat returns before they happen.**

![ForeverHome AI](public/cat.png)

---

## 🎯 The Problem

7–20% of shelter cats are returned within 6 months — not because they're unadoptable, but because of preventable mismatches between a cat's needs and an adopter's lifestyle. New adopters panic at normal adjustment behaviors (hiding, not eating) because no one explained what to expect. Every return costs shelters time, emotional resources, and capacity.

---

## 💡 Our Solution

ForeverHome AI is a decision-support and adopter-education platform that helps shelters:

1. **Identify compatibility concerns before adoption** — transparent, rule-based assessment engine
2. **Support adopters during the critical first 14 days** — AI Coach with daily check-ins and progress tracking
3. **Give shelters visibility without daily phone calls** — check-in timelines and insights dashboard

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  FOREVERHOME AI                  │
├─────────────────────────────────────────────────┤
│  FRONTEND (Next.js App Router + Tailwind)        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Cat      │  │ Assessment│  │ Compatibility │  │
│  │ Browsing │─▶│ Quiz     │─▶│ Report        │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│                                      │           │
│                                      ▼           │
│  ┌──────────────────────────────────────────┐   │
│  │          14-Day Coach                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Check-ins │ │Timeline  │ │AI Chat   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                                      │           │
│  ┌──────────────────┐  ┌────────────────────┐   │
│  │ Shelter Insights │  │ Smart Escalation   │   │
│  │ (Patterns)       │  │ (Human handoff)    │   │
│  └──────────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────────┤
│  BACKEND (Next.js API Routes)                    │
│  ┌────────────────┐  ┌──────────────────────┐   │
│  │ Gemini AI      │  │ Firestore Database   │   │
│  │ (Counselor +   │  │ (Cats, Matches,      │   │
│  │  Coach)        │  │  Check-ins, Users)   │   │
│  └────────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────┤
│  CORE ENGINE (Client-side TypeScript)            │
│  ┌──────────────────────────────────────────┐   │
│  │ Compatibility Assessment Engine          │   │
│  │ • 9+ deterministic rules                 │   │
│  │ • No AI — transparent decisions          │   │
│  │ • Alternative cat recommendations        │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Medical Escalation Layer                 │   │
│  │ • 26 emergency keywords                  │   │
│  │ • Intercepts BEFORE AI                   │   │
│  │ • Routes to human/vet immediately        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔬 Transparent Compatibility Engine
- 9+ deterministic rules (no black-box AI)
- Exact triggered rules shown to adopters
- Alternative cat recommendations for mismatches
- "Shelter review recommended" for flagged cases

### 🗓️ 9 Lives Protocol + Maintenance Mode
- Days 1–9: Core bonding curriculum
- Days 10–14: Maintenance Mode for long-term settling
- Daily check-ins (4 toggles + optional note, 15 seconds)
- Visual progress timeline (hiding → on the bed → on the couch)

### 🤖 Context-Aware AI Coach
- Injected with cat behavioral profile + check-in history
- References specific data: "I see he's eating but still hiding on Day 3"
- Medical keywords intercepted deterministically before AI call
- Permanent emergency contact buttons always visible

### 🚨 Smart Escalation Ticket
- Priority detection (urgent vs. behavioral)
- Packages daily logs + chat history into a report
- Sends to shelter behaviorists for human review
- No real-time chat dependency — professional, reliable

### 📊 Shelter Insights
- Active adoptions overview
- Cats needing attention (missed check-ins, concerning patterns)
- Common compatibility concerns ranked by frequency
- Turns individual assessments into organizational learning

### 🔐 Security
- Gemini API keys never exposed to browser (calls happen server-side in API routes)
- Firestore RBAC: isolated adopter profiles, shelter-only cat editing (`firestore.rules`)
- API routes verify the caller's Firebase ID token before returning or modifying another uid's data (wishlist, AI coach profile context) — see `src/lib/verifyAuthToken.ts`
- AI chat logs: write-only in Firestore `aiLogs` collection (privacy-first, no conversation context stored) — see `src/lib/aiLoggingService.ts`
- Medical escalation: deterministic safety layer BEFORE AI
- Full security review in [`docs/security.md`](docs/security.md) — includes OWASP Top 10 coverage

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design system |
| UI Components | shadcn/ui + custom CatElements |
| Auth & DB | Firebase Auth + Firestore |
| AI | Google Gemini API (server-side route handlers) |
| PWA | @ducanh2912/next-pwa |
| Deployment | Vercel |
| Animation | Framer Motion |

---

## 🚀 Getting Started

```bash
git clone https://github.com/yuno0006/foreverhome-ai.git
cd foreverhome-ai
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app
GEMINI_API_KEY=your_gemini_key
```

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🗺️ Demo Flow

```
Landing → Browse Cats → Select Barnaby → Assessment Quiz
→ Compatibility Report (High Risk) → AI Counselor Explanation
→ Alternative: Luna (Low Risk) → Adoption Confirmed
→ 14-Day Coach: Check-ins → Timeline → AI Chat → Escalation
→ Shelter Insights → Outcome Comparison
```

### 60-Second Judge Walkthrough

No account required to explore the core flow:

1. **Landing (`/`)** — read the pitch, click "Take Quiz"
2. **Assessment (`/assessment/barnaby`)** — answer 5 scenario questions as a guest
3. **Report (`/report/[matchId]`)** — see the compatibility level, triggered rules, and AI explanation
4. **Coach (`/coach/barnaby-adoption-1`)** — see the 9 Lives Protocol, daily check-in, and AI chat
5. **Insights (`/insights`)** — shelter-side view of adoption patterns
6. **Outcome (`/outcome`)** — the with/without ForeverHome story

To test authenticated flows (profile, dashboard, saved cats), use the demo credentials shown on the `/login` page, or register a new account — both roles (Adopter / Shelter Staff) are supported.

---

## ⚠️ Important Disclaimer

> **ForeverHome AI is not a replacement for shelter professionals or veterinarians. It is a decision-support and adopter-education platform designed to help shelters make consistent assessments and provide better post-adoption guidance.**

The compatibility assessment is transparent and rule-based — it does not predict outcomes, diagnose behavior, or make adoption decisions. AI is used only to explain structured results and provide behavioral support. Medical concerns are intercepted deterministically and escalated to humans immediately.

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── page.tsx                  # Landing
│   ├── cats/page.tsx             # Cat browsing
│   ├── assessment/[catId]/       # Assessment quiz
│   ├── report/[matchId]/         # Compatibility report
│   ├── coach/[adoptionId]/       # 14-Day Coach
│   ├── outcome/page.tsx          # With/without comparison
│   ├── dashboard/page.tsx        # Adopter dashboard
│   ├── saved/page.tsx            # Wishlist
│   ├── shelters/[id]/            # Shelter profiles + reviews
│   ├── shelter/                  # Shelter staff console (role-guarded)
│   │   ├── dashboard/page.tsx    # Shelter overview
│   │   ├── cats/                 # Cat inventory management
│   │   ├── adoptions/page.tsx    # Active adoption tracking
│   │   ├── insights/page.tsx     # Shelter insights & concern patterns
│   │   └── staff/page.tsx        # Staff management
│   ├── about/page.tsx            # About + architecture
│   ├── onboarding/page.tsx       # Adopter / shelter profile setup
│   ├── profile/page.tsx          # User profile
│   ├── login/page.tsx            # Sign in
│   ├── register/page.tsx         # Sign up
│   └── api/                      # Route handlers
│       ├── coach/route.ts        # Gemini coach endpoint
│       ├── counselor/route.ts    # Gemini counselor endpoint
│       ├── escalation/route.ts   # Smart escalation endpoint
│       └── saved/route.ts        # Wishlist endpoint
├── components/
│   ├── coach/                    # Chat, Check-in, Timeline, Escalation
│   ├── report/                   # Badge, Concerns, Mitigations, Alternatives
│   ├── insights/                 # CatsNeedingAttention, CommonConcerns
│   ├── assessment/               # Questions, Progress, Scenario
│   ├── cats/                     # CatCard, CatProfile
│   ├── auth/                     # AuthGuard (route protection)
│   ├── layout/                   # Header, Footer
│   └── ui/                       # shadcn + CatElements
├── lib/
│   ├── compatibilityEngine.ts    # Core assessment engine
│   ├── medicalEscalation.ts      # Safety keyword detection
│   ├── gemini.ts                 # AI API client
│   ├── aiLoggingService.ts       # AI interaction logging (write-only, privacy-first)
│   ├── verifyAuthToken.ts        # Server-side Firebase ID token verification
│   ├── firebase.ts               # Firebase config
│   └── firestoreService.ts       # Database operations
├── data/
│   └── demoCats.ts               # 9 demo cat profiles
├── types/                        # TypeScript type definitions
│   └── aiLog.ts                  # AI log types (AILog, AILogInput)
└── __tests__/                    # Vitest + fast-check test suites
docs/
├── README.md                     # Docs index
├── architecture.md               # System architecture & data flow
├── api.md                        # API endpoint reference
└── security.md                   # Security architecture & OWASP review
```

---

## 🐱 World Cat Domination Day

Every forever home is a new base of operations. When cats are properly matched, supported through their transition, and monitored by shelters — they don't just survive. They thrive. And from every secure, loving home, one more cat peacefully rules their domain.

**#HackTheKitty 2026**
