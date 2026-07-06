# 🐾 ForeverHome AI

> **Built for [#HackTheKitty 2026](https://hackthekitty.com/) — World Cat Domination Day Hackathon**

**Preventing cat returns before they happen — through AI-powered compatibility assessment and post-adoption coaching.**

![ForeverHome AI](public/cat.png)

---

## 🎯 The Problem

**7–20% of shelter cats are returned within 6 months** — not because they're "unadoptable," but because of preventable mismatches between a cat's needs and an adopter's lifestyle. New adopters panic at normal adjustment behaviors (hiding, not eating) because no one explained what to expect. Every return costs shelters time, emotional resources, and capacity — and each returned cat becomes harder to adopt again.

---

## 💡 Our Solution

ForeverHome AI is a **decision-support and adopter-education platform** that helps shelters prevent returns at every stage of the adoption journey:

| Stage | Feature | What It Does |
|-------|---------|-------------|
| **Pre-Adoption** | Compatibility Assessment | 10-question quiz → deterministic engine → transparent risk report |
| **Pre-Adoption** | AI Counselor | Context-aware explanation of match quality + alternative suggestions |
| **Pre-Adoption** | Whisker Runner Game | Mini-game integrating cat-like reflexes with platformer mechanics |
| **Post-Adoption** | 9 Lives Protocol | Gamified 14-day curriculum — one challenge unlocked per day |
| **Post-Adoption** | AI Coach (Mr. Cat) | Cat-specific guidance with behavioral profile + check-in history |
| **Post-Adoption** | Smart Escalation | Priority reports to shelter behaviorists for human review |
| **Shelter Side** | Insights Dashboard | Adoption tracking, concern patterns, cats needing attention |

---

## ✨ Key Features

### 🔬 Transparent Compatibility Engine (No Black-Box AI)

The core assessment uses **9+ deterministic rules** — no machine learning, no black-box decisions. Every concern is explained with exact rule logic shown to the adopter:

| Rule | What It Checks |
|------|---------------|
| `stress-noise` | High stress sensitivity + noisy household |
| `stress-children` | Not child-comfortable + young children at home |
| `energy-absence` | High-energy cat + 10+ hours away + no vertical space |
| `vertical-space` | Needs climbing space + no enrichment plan |
| `dog-incompatibility` | Dog-unfriendly + resident dog(s) |
| `special-care` | Medical needs + adopter uncomfortable with care |
| `indoor-safety` | Indoor-only requirement + insecure home |
| `unknown-compatibility` | Unknown behavioral data in relevant areas |
| `senior-cat-absence` | Senior with medical needs + long daily absence |
| `fiv-experience` | FIV+ cat + no prior cat/special-needs experience |

**Risk Tiers**: `Low` (0 significant concerns) → `Moderate` (1 concern) → `High` (2+ concerns)

For Moderate/High matches, the engine automatically recommends alternative cats with better compatibility — not to reject the match, but to give options.

### 🗓️ 9 Lives Protocol™ — Gamified Post-Adoption Curriculum

Inspired by the myth that cats have 9 lives, we flipped the concept: instead of losing lives, adopters and cats **survive each challenge together**, building trust daily:

```
Day 1 👻 "The Ghost"        — Surviving the hiding phase
Day 2 🍗 "The Hunger Strike" — Encouraging the first meal
Day 3 🌙 "The 3 AM Zoomies"  — Managing night activity
Day 4 🚽 "The Litterbox Rebellion" — Solving bathroom issues
Day 5 🛋️ "The Furniture Test" — Protecting your couch
Day 6 😺 "The Belly Trap"    — Learning cat body language
Day 7 🪟 "The Window Watcher"  — Managing barrier frustration
Day 8 🏠 "The Scent Swap"    — Expanding territory
Day 9 👑 "The Commander Ascends" — Permanent routine established
Days 10-14: Maintenance Mode — consolidation phase
```

Each day unlocks a new "Life" with actionable tips, behavioral explanations, and red-flag warnings.

### 🤖 Context-Aware AI Coach (Mr. Cat)

Unlike generic pet advice, Mr. Cat is injected with:

- **Full cat behavioral profile** (energy level, stress sensitivity, children/dog/cat compatibility, medical needs)
- **Complete check-in history** (eating patterns, litter habits, hiding behavior, activity level, notes)
- **Current adoption day** (contextualizing what's normal at each stage)
- **Optional photo analysis** — adopter can share a photo; AI describes what it sees

Example: *"I see Barnaby has been eating well (good sign!) but still hiding on Day 3. This is completely normal — let's talk about why..."*

### 🚨 Deterministic Medical Safety Layer

**26 emergency keywords** are scanned before any AI call. If detected, the system returns an immediate medical emergency response without ever contacting the AI:

- "trouble breathing", "seizure", "unconscious", "collapse", "poison", "bleeding", "unresponsive"...

This is defense-in-depth: even if the AI hallucinates, the safety layer catches emergencies first.

### 📊 Shelter Insights Dashboard

- Active adoptions overview with check-in status
- Cats needing attention (missed check-ins, concerning patterns)
- Common compatibility concerns ranked by frequency
- Turns individual assessments into organizational learning

### 🎮 Whisker Runner Mini-Game

An endless-runner platformer built in Canvas + TypeScript where the cat dodges obstacles, collects treats, and competes for high scores. Complete with:
- Custom cat sprite animations (run, jump, idle, hit, celebration)
- Obstacle generation with progressive difficulty
- Deterministic RNG for reproducible levels
- High score persistence (Firestore auth / sessionStorage demo)
- Integration test suite with property-based obstacle testing

### 🗣️ TTS Narration

Compatibility reports feature text-to-speech for accessibility — the Web Speech API reads reports aloud with a configurable speaking rate.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FOREVERHOME AI                        │
├─────────────────────────────────────────────────────────┤
│  FRONTEND — Next.js 16 App Router + Tailwind CSS v4     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ 9 Cats   │  │  10-Question │  │  Compatibility    │  │
│  │ Browsing │─▶│  Assessment  │─▶│  Report + AI      │  │
│  │ (profiles│  │  Quiz        │  │  Explanation +    │  │
│  │  photos) │  │  (scenarios) │  │  TTS Narration    │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│                                               │         │
│  ┌────────────────────────────────────────┐   │         │
│  │         14-Day AI Coach                │◀──┘         │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │            │
│  │  │ Daily    │ │ 9 Lives  │ │ Mr. Cat│  │            │
│  │  │ Check-ins│ │ Timeline │ │ AI Chat│  │            │
│  │  └──────────┘ └──────────┘ └────────┘  │            │
│  │              ┌──────────────────┐       │            │
│  │              │ Smart Escalation │       │            │
│  │              │ (Human handoff)  │       │            │
│  │              └──────────────────┘       │            │
│  └────────────────────────────────────────┘            │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐     │
│  │ Shelter Insights │  │ Whisker Runner Game      │     │
│  │ (Adoption stats, │  │ (Canvas endless runner)  │     │
│  │  concern patterns│  │                          │     │
│  └──────────────────┘  └──────────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│  SERVER — Next.js API Route Handlers (never client)     │
│  ┌────────────────────┐  ┌─────────────────────────┐   │
│  │ Gemini AI (v1beta)  │  │ Firebase Auth + Firestore │  │
│  │ • 3-tier model chain│  │ • 10 collections RBAC    │  │
│  │ • Rate-limit fallback│  │ • ID token verification  │  │
│  │ • 8s timeout/retry  │  │ • jose JWKS validation   │  │
│  │ • Image input support│  │ • aiLogs (write-only)    │  │
│  └────────────────────┘  └─────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Security Layer                       │   │
│  │  - Medical keywords scan (deterministic, pre-AI)  │   │
│  │  - Firebase ID token verification on all endpoints │   │
│  │  - UID matching (prevents IDOR/profile exfiltration)│  │
│  │  - Field type+size validation in Firestore rules   │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  CORE ENGINE — Client-side TypeScript (strict mode)     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Compatibility Assessment Engine                 │   │
│  │  • 10 deterministic rules                        │   │
│  │  • No AI in matching decisions                   │   │
│  │  • Alternative cat recommendations               │   │
│  │  • Non-recursive alt-finding (stack safe)        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Medical Escalation Layer                        │   │
│  │  • 26 emergency keywords                         │   │
│  │  • Intercepts BEFORE any AI API call             │   │
│  │  • Routes to vet/human immediately               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Deterministic compatibility (no AI)** — transparent, consistent, no hallucination risk in matching
2. **Server-side AI only** — Gemini API keys never exposed to the browser
3. **Cascading model failover** — 3 Gemini model tiers with auto-degradation on rate limits
4. **Deterministic safety layer** — medical keywords intercepted before any AI call (defense-in-depth)
5. **Demo-first development** — entire app works without Firebase, using sessionStorage + static data
6. **TypeScript strict mode** — full type safety across entire codebase
7. **No Firebase Admin SDK** — token verification via `jose` against Google JWKS, avoiding service account secrets

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 16** (App Router, Turbopack) | Full-stack React framework |
| Language | **TypeScript 5** (strict mode) | Type safety across 151 source files |
| Styling | **Tailwind CSS v4** + custom design tokens | Consistent warm-themed UI |
| Components | **shadcn/ui** + custom CatElements | Accessible, composable UI |
| Auth | **Firebase Authentication** | Email/password + Google sign-in |
| Database | **Cloud Firestore** (10 collections) | User data, cats, assessments, adoptions |
| AI | **Google Gemini API** (v1beta, 3-tier failover) | Counselor + Coach + Assistant |
| Animation | **Framer Motion** | Smooth page transitions, modals, drawers |
| Game | **Canvas API + TypeScript** | Whisker Runner endless runner |
| TTS | **Web Speech API** | Report narration for accessibility |
| PWA | **@ducanh2912/next-pwa** | Offline support, installable web app |
| Testing | **Vitest + fast-check** (22 suites) | Unit, integration, property-based |
| Linting | **ESLint 9** (next/core-web-vitals) | Code quality enforcement |
| Deployment | **Vercel** | Edge-optimized hosting |

---

## 🔬 Testing — Property-Based & Edge Cases

**22 test files** covering deterministic correctness with **fast-check** (property-based testing):

| Test Suite | Lines | What It Tests |
|------------|-------|--------------|
| `compatibilityEngine.rules.properties.test.ts` | 732 | Random adopter × cat combos — verifies all 10 rules trigger correctly |
| `compatibilityEngine.rules.test.ts` | 683 | Individual rule edge cases (null fields, boundary values) |
| `compatibilityEngine.properties.test.ts` | 764 | Overall engine invariants (level monotonicity, concern count bounds) |
| `coachResponse.properties.test.ts` | 651 | AI coach prompt integrity across random inputs |
| `coachEdgeCases.test.ts` | 425 | Medical keywords, image handling, empty messages |
| `fallbackMechanism.properties.test.ts` | 530 | Fallback response coverage for all message patterns |
| `checkinData.properties.test.ts` | 819 | Check-in data validation, day boundaries, progress math |
| `checkinFlow.integration.test.ts` | 769 | Full check-in lifecycle: create → update → verify |
| `error-handling.test.ts` | 1024 | Network failures, timeouts, retries, edge values |
| `accessibility.property.test.ts` | 354 | WCAG patterns, alt text, labeling properties |
| `medicalEscalation.test.ts` | 448 | All 26 keywords, case insensitivity, partial matches |
| `demoCats.test.ts` | 493 | Cat data integrity, required fields, enum values |
| `gameEngine.test.ts` | 763 | Collision detection, scoring, obstacle progression |
| `highScoreStorage.test.ts` | 192 | Score persistence, sorting, limits |
| + 8 more | 810 | UI components, sprites, integration flows |

**Run tests**:
```bash
npm test           # Watch mode
npm run test:run   # Single run
npm run test:coverage  # With coverage
```

---

## 🔐 Security

### Aikido Security Scan — Summary

| Severity | Count | Status |
|----------|-------|--------|
| ~~High~~ | 3 → 1 | 2 Remediated via overrides + validation |
| ~~Medium~~ | 5 → 0 | All Remediated (XSS redirect fix, rollup override, Python path guard, Firestore guards) |

### Remediated Findings

| Issue | Severity | Fix |
|-------|----------|-----|
| serialize-javascript (CVE) | High | Override → `^7.0.7` in `package.json` |
| fast-uri (CVE-2026-13676) | High | Override → `^3.1.2` in `package.json` |
| rollup (XSS vector) | Medium | Override → `^2.79.2` in `package.json` |
| XSS — login redirect | Medium | `redirectTo` validated: must start with `/`, not `//` |
| Python path traversal | Medium | `_load_csv()` resolves → verifies stays in `DATA_DIR` |
| IDOR (Firestore assessments) | High | Added `is string` + `size()` guards to prevent null-bypass |
| IDOR (Firestore shelters) | High | Added `is string` + `size()` guards on `adminUid` |
| Escalation/adoption spam | Medium | Added `size()` bounds on all string fields |

### Security Architecture

| Layer | Protection |
|-------|-----------|
| **Gemini API keys** | Never in browser — server-side API routes only |
| **API auth** | Firebase ID tokens verified via `jose` against Google JWKS |
| **UID matching** | All endpoints verify `caller.uid === requested.uid` (prevents IDOR) |
| **Firestore RBAC** | 10-collection rules: isolated profiles, shelter-ownership validation |
| **Medical safety** | 26-keyword deterministic scan before any AI call |
| **AI logs** | Write-only collection — no user reads, admin-only via Cloud Functions |
| **Input validation** | TypeScript strict mode + field type/size bounds in Firestore rules |
| **Dependencies** | Locked versions, Aikido continuous scanning, 3 security overrides |
| **Rate limiting** | Gemini tier fallback with HTTP 429 caching (90s cooldown) |

Full details: [`docs/security.md`](docs/security.md)

---

## 🎨 UX / UI

### Design System

- **Warm, cat-focused palette**: terracotta (`#C0603E`) + cocoa (`#5C3D2E`) + cream (`#FFF9ED`) + sage (`#7A9C7E`) + honey accent (`#F2A65A`)
- **Typography**: Nunito (rounded, friendly) for body, Fredoka (playful headings)
- **Dark mode**: Full theming via `next-themes` with warm dark palette (dark cocoa backgrounds, soft coral accents)
- **Motion**: Framer Motion transitions on page changes, modal reveals, mobile drawer
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation, high-contrast toggle-ready

### Key UI Moments

- **Landing page**: Animated cat patrol, benefit cards, "Take Quiz" CTA, stats counter
- **Cat profiles**: Photo gallery, personality trait cards, behavioral breakdown, ideal home description
- **Compatibility Report**: Color-coded badge (green/yellow/red), triggered rules with descriptions, mitigation steps, AI explanation with TTS, alternative cats grid
- **9 Lives Timeline**: Visual progress bar, day-by-day unlock cards with emoji + actionable tips
- **Coach Chat**: Bubble UI with Mr. Cat avatar, photo upload, emergency contact banner, floating input
- **Smart Escalation**: Modal with last 3 check-ins (color-coded) + chat context, 24h response badge
- **Whisker Runner**: Full-screen Canvas game with custom sprite animations

### PWA Support

Installable on mobile/home screen with offline support, custom manifest, and service worker via `@ducanh2912/next-pwa`.

---

## 🚀 Getting Started

```bash
git clone https://github.com/yuno0006/foreverhome-ai.git
cd foreverhome-ai
npm install
```

Create `.env.local`:
```env
# Firebase (required for auth + database)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app

# Gemini AI (required for AI features)
GEMINI_API_KEY=your_gemini_key
```

```bash
npm run dev
# Open http://localhost:3000
```

**Demo mode**: The app works without Firebase credentials using sessionStorage and 9 built-in demo cats.

```bash
npm run build   # Production build
npm start       # Production server
npm test        # Run tests
```

---

## 🗺️ Judge Walkthrough (60 Seconds)

**No account required** — the entire core flow works in demo mode:

| Step | Route | What to See |
|------|-------|------------|
| 1 | `/` | Landing page — animated cat, stats, "Start Quiz" CTA |
| 2 | `/cats` | Browse 9 cats with rich profiles (behavior, personality, backstory) |
| 3 | `/assessment/barnaby` | 10-question compatibility quiz (scenario-based) |
| 4 | `/report/[matchId]` | Risk level badge, triggered rules, AI explanation, TTS narration |
| 5 | `/coach/barnaby-adoption-1` | 9 Lives Protocol, daily check-in, Mr. Cat AI chat |
| 6 | `/insights` | Shelter-side view — adoption patterns + concern analysis |
| 7 | `/outcome` | With/without ForeverHome story comparison |

**Authenticated flows** (use demo credentials on `/login`): Profile, Dashboard, Saved Cats, Shelter Console.

---

## 📁 Project Structure

```
foreverhome-ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout (PWA, theme, fonts)
│   │   ├── globals.css               # Tailwind v4 + design tokens
│   │   ├── cats/                     # Cat browsing + profiles
│   │   ├── assessment/[catId]/       # Compatibility quiz
│   │   ├── report/[matchId]/         # Compatibility report + TTS + AI
│   │   ├── coach/[adoptionId]/       # 14-Day AI Coach
│   │   ├── dashboard/                # Adopter dashboard
│   │   ├── saved/                    # Wishlist
│   │   ├── insights/                 # Shelter insights (public)
│   │   ├── outcome/                  # With/without comparison
│   │   ├── shelter/                  # Shelter staff console (role-guarded)
│   │   │   ├── dashboard/            # Overview + active adoptions
│   │   │   ├── cats/                 # Cat inventory CRUD
│   │   │   ├── adoptions/            # Adoption request tracking
│   │   │   ├── insights/             # Concern patterns + analytics
│   │   │   └── staff/                # Staff management
│   │   ├── about/                    # Architecture overview
│   │   ├── login/                    # Sign in (with open-redirect fix)
│   │   ├── register/                 # Sign up
│   │   ├── onboarding/               # Role + profile setup
│   │   └── api/                      # Route handlers
│   │       ├── coach/route.ts        # AI coach endpoint
│   │       ├── counselor/route.ts    # AI counselor endpoint
│   │       ├── assistant/route.ts    # General AI assistant
│   │       ├── escalation/route.ts   # Smart escalation endpoint
│   │       ├── adoption-request/     # Adoption request submission
│   │       └── saved/route.ts        # Wishlist CRUD
│   ├── components/
│   │   ├── coach/                    # Chat, CheckIn, Timeline, Escalation
│   │   ├── report/                   # Badge, Concerns, Mitigations, AltCats
│   │   ├── assessment/               # Questions, Progress, Scenario
│   │   ├── insights/                 # CatsNeedingAttention, CommonConcerns
│   │   ├── game/                     # WhiskerRunner game + sprites
│   │   ├── cats/                     # CatCard, CatProfile
│   │   ├── auth/                     # AuthGuard (route protection)
│   │   ├── layout/                   # Header (nav, wishlist count, mobile drawer)
│   │   └── ui/                       # shadcn + CatElements
│   ├── lib/
│   │   ├── compatibilityEngine.ts    # 10-rule deterministic engine
│   │   ├── medicalEscalation.ts      # 26 emergency keywords
│   │   ├── gemini.ts                 # Gemini API (3-tier failover, image input)
│   │   ├── aiLoggingService.ts       # Write-only AI log (privacy-first)
│   │   ├── verifyAuthToken.ts        # Firebase ID token verification (jose)
│   │   ├── firebase.ts               # Firebase config
│   │   ├── firestoreService.ts       # Database operations
│   │   └── whiskerRunner/            # Game engine, RNG, high scores
│   ├── data/
│   │   ├── demoCats.ts               # 9 detailed cat profiles
│   │   └── nineLivesProtocol.ts      # 9 Lives curriculum
│   ├── types/                        # TypeScript interfaces
│   └── __tests__/                    # Integration + property tests
├── docs/
│   ├── architecture.md               # System architecture + data flow
│   ├── api.md                        # API endpoint reference
│   └── security.md                   # Full security review + Aikido scan
├── firestore.rules                   # 10-collection RBAC
├── vitest.config.ts                  # Test configuration
├── vercel.json                       # Deployment config
└── package.json                      # Dependencies + overrides
```

---

## ⚠️ Important Disclaimer

> **ForeverHome AI is not a replacement for shelter professionals or veterinarians.** It is a decision-support and adopter-education platform designed to help shelters make consistent assessments and provide better post-adoption guidance.

The compatibility assessment is transparent and rule-based — it does not predict outcomes, diagnose behavior, or make adoption decisions. AI is used only to explain structured results and provide behavioral support. Medical concerns are intercepted deterministically and escalated to humans immediately.

---

## 🏆 HackTheKitty 2026 Judging Criteria

### Technical Execution (25%)
- **151 TypeScript files** in strict mode — no `any` types
- **Next.js 16 App Router** with Turbopack, server-side API routes
- **22 test suites** with property-based testing (fast-check), integration tests, edge case coverage
- **Cascading AI failover**: 3 Gemini model tiers with rate-limit caching and 8s timeouts
- **Durable execution**: deterministic fallback responses when AI is unavailable
- **Clean architecture**: clear separation between deterministic engine (client), AI (server), and data (Firestore)

### Innovation & Creativity (20%)
- **Deterministic compatibility engine** — AI is used to explain results, never to make decisions. This is the opposite of the industry trend toward black-box AI matching
- **9 Lives Protocol** — gamified post-adoption curriculum that turns common failure points into achievement milestones
- **Medical safety layer** — deterministic keyword interception before AI, preventing hallucinated medical advice
- **Whisker Runner** — mini-game reinforcing the brand while providing fun engagement
- **Privacy-first AI logging** — write-only logs, no conversation context stored, immutable records

### Theme Relevance (15%)
- Built for **World Cat Domination Day** — every forever home is a new base of operations
- The 9 Lives Protocol culminates in "The Commander Ascends" — the cat establishes permanent dominion
- Whisker Runner: the cat dodges obstacles (adoption challenges) and collects treats (successful adjustments)
- The entire brand is built around cats ruling their domain from a secure, loving home

### Documentation (10%)
- **Complete README** with architecture, setup, walkthrough, tech stack
- **`docs/architecture.md`** — system design, data flow, design decisions
- **`docs/api.md`** — endpoint reference with request/response examples
- **`docs/security.md`** — OWASP Top 10 coverage + Aikido scan report
- **Code comments** throughout: JSDoc on functions, inline explanations for complex logic
- **Firestore rules** documented per-collection with security rationale

### Security (15%)
- **Aikido Security scan** completed — 6 of 8 findings remediated in code
- **Firestore RBAC**: 10-collection rules with field validation, UID matching, shelter-ownership checks
- **Server-side AI**: Gemini keys never in browser, all calls proxied through API routes
- **ID token verification**: `jose` JWKS validation on every protected endpoint
- **Input validation**: field type + size guards in Firestore rules, TypeScript strict mode
- **Medical safety**: deterministic keyword interception before any AI call
- **Dependency overrides**: serialize-javascript, fast-uri, rollup CVEs patched
- **Full report**: `docs/security.md`

### UX / UI (15%)
- **Warm, cohesive design system**: terracotta-cocoa-cream palette with Nunito typography
- **Dark mode** with warm dark palette
- **Framer Motion** animations throughout
- **TTS narration** for accessibility
- **PWA**: installable on mobile with offline support
- **Smart escalation modal**: color-coded check-in preview, 24h response badge
- **9 Lives timeline**: visual progress tracking with emoji identifiers
- **Responsive design**: mobile-first with hamburger drawer, desktop pill nav
- **Role-aware navigation**: different nav for adopters vs shelter staff vs guests
- **Whisker Runner**: full game UI with sprite animations, score display, dialog flow

---

## 🐱 World Cat Domination Day

Every forever home is a new base of operations. When cats are properly matched, supported through their transition, and monitored by shelters — they don't just survive. They thrive. And from every secure, loving home, one more cat peacefully rules their domain.

**#HackTheKitty 2026**
