# #HackTheKitty 2026 — Project Report

**Project Name:** ForeverHome AI  
**Reference ID:** 7WYRJRX3  
**Deployment:** [https://forever-home-ai.vercel.app/](https://forever-home-ai.vercel.app/) (Website + PWA)

---

## 1. Executive Summary

ForeverHome AI serves as an intelligent matching system designed to minimize adoption reversals by pairing felines with suitable owners via methodical compatibility evaluations. Furthermore, the tool offers tailored support throughout the initial two-week transition period to ensure sustainable bonding and successful integration.

With **7–20% of shelter cats returned within 6 months** — usually due to preventable mismatches rather than behavioral problems — ForeverHome AI addresses this at every stage of the adoption journey:

- **Pre-Adoption**: A dynamic Cat-Specific AI Assessment tests adopters with exactly 4 scenario questions tailored to the specific cat they are applying for. The deterministic engine then flags risk areas (noise sensitivity, energy mismatch, medical needs) and automatically recommends better-matched alternatives. Every cat profile page includes an AI Quick Match widget for instant compatibility previews.
- **Post-Adoption**: A gamified 14-day curriculum called the **9 Lives Protocol™** guides adopters through common challenges (hiding, not eating, zoomies), while an **AI Coach (Mr. Cat)** provides cat-specific contextual advice — injected with that specific cat's behavioral profile and the adopter's complete check-in history.
- **Safety First**: A deterministic medical escalation layer with 26 emergency keywords intercepts urgent situations before any AI call, routing them to immediate human attention. We deliberately chose **not to build shelter-adopter chat** — shelters lack the staffing for real-time messaging, so AI handles 90% of questions instantly and Smart Escalation surfaces only the 10% needing human review.
- **Shelter Side**: An insights dashboard, cat inventory management, adoption request tracking, and concern analytics help shelter staff operate efficiently.
- **Engagement Layer**: Whisker Runner mini-game and a 19-card Fun Facts Slideshow keep users engaged while educating them about cat behavior — building realistic expectations before adoption.

The system was built in **151 TypeScript files** using Next.js 16, Firebase, and Google Gemini AI — with a **deterministic-first philosophy**: AI explains results but never makes the matching decision itself. The application is deployed at **[forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/)** and available as both a responsive website and an installable Progressive Web App (PWA) with offline support.

### Full User Journey (Account Required)

The app requires an account for all features. The onboarding flow captures lifestyle data critical for compatibility matching, and the 14-day coach requires persistent check-in history:

```
1. Login / Register (Google OAuth or Email/Password)
     ↓
2. Onboarding — Role Selection (Adopter or Shelter Staff)
     ↓  (Adopter: 12 fields)
   Home type, garden, indoor-only, children + ages, other pets, 
   cat experience, work schedule, household activity, personality 
   preference, age preference, special needs openness
     ↓  (Shelter: name, address, phone, email, optional cat creation)
     ↓
3. Dashboard — Personalized command center
   • Profile completion status + edit link
   • Past assessments with risk badges (High/Moderate/Low)
   • Active adoptions with day counter + "Open Coach" button
   • Quick links: Browse Cats, View Report
     ↓
4. Browse Cats → Cat Profile (photo gallery, behavior bars, backstory, 
   AI Quick Match) → Cat-Specific Dynamic Assessment (4 custom AI questions) → Compatibility Report
   (risk badge, rules, AI explanation, TTS, alternatives) → Start 14-Day Coach
```

**Why account-first?** Compatibility data must persist across sessions. The 14-day coach requires check-in history. Shelters need verified identities for adoption requests. A demo-only experience cannot provide the continuity adopters need during the critical settling period.

---

## 2. Project Overview

### 2a. Why You're Building What You're Building

Shelter cat returns are a silent crisis in animal welfare. Studies consistently show that **7–20% of adopted cats are returned within 6 months**, and the primary causes are preventable:

- **Lifestyle mismatches**: A high-energy Bengal adopted into a small apartment with no enrichment
- **Unrealistic expectations**: Adopters panic when a cat hides for 3 days, not knowing this is normal adjustment behavior
- **Medical anxiety**: An FIV+ cat adopted by someone unprepared for special-needs care
- **Zero post-adoption support**: Most shelters lack resources for follow-up — adopters are on their own after paperwork

Every return costs shelters time, money, kennel capacity, and emotional resources. Each returned cat becomes harder to re-adopt. We built ForeverHome AI to give shelters a scalable, affordable tool that prevents these failures before they happen.

### 2b. How It Relates to the Theme

**World Cat Domination Day** is about cats ruling their domain from a secure, loving base. ForeverHome AI makes this literal:

- **Every forever home is a new base of operations** — the compatibility engine ensures cats are deployed to environments where they'll thrive, not just survive
- **The 9 Lives Protocol™** reimagines the myth: instead of losing lives, cats and adopters survive 9 increasingly ambitious challenges together, culminating on Day 9 with **"The Commander Ascends"** — the moment the cat establishes permanent dominion over its household
- **Whisker Runner** — the cat dodges obstacles (adoption challenges) and collects treats (successful adjustments), training adopters to think about cat reflexes and needs
- The entire brand is built on cat supremacy: the landing page features a cat "patrol," the color palette is warm and feline (terracotta, cocoa, cream), and even the AI coach persona is Mr. Cat himself

### 2c. Target Audience

| User | Use Case |
|------|----------|
| **Shelter staff / behaviorists** | Standardized compatibility assessments, adoption tracking, concern pattern detection, smart escalation queue, cat inventory management |
| **Prospective adopters** | Account → onboarding → browse cats with rich behavioral profiles → AI Quick Match preview → dynamic cat-specific assessment → transparent compatibility report with alternatives → daily check-ins → 14-day AI coach |
| **Recent adopters** | Daily check-ins (eating, litter, hiding, activity), gamified 14-day curriculum, AI Coach (Mr. Cat) with cat-specific behavioral advice, photo sharing, Smart Escalation when needed |
| **Shelter admins / directors** | Insights dashboard — active adoptions, cats needing attention, common compatibility concerns ranked by frequency, adoption request review, staff management |

> **Note:** An account is required to use the platform. The landing page, cat profiles, and Whisker Runner game are viewable without login, but assessment, coaching, and dashboard features require authentication + completed onboarding.

---

## 3. Key Features

### Onboarding — 12-Field Adopter Profile Setup
Immediately after login, first-time users complete onboarding: role selection (Adopter or Shelter Staff), then a 12-field lifestyle questionnaire capturing home type, garden access, indoor-only preference, children (with age ranges), other pets (with counts), cat experience level, work schedule, household activity, personality preferences, age preferences, and special-needs openness. This data is critical — it feeds directly into the compatibility engine. Without it, matching cannot be accurate.

### Deterministic Compatibility Engine (No Black-Box AI)
10 fixed rules assess cat-adopter compatibility — no machine learning, no black-box decisions. Every concern is transparent and explained:

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

Reports show a color-coded risk badge (Green/Yellow/Red), exact rule logic, mitigation steps, and automatically recommended alternative cats with better compatibility.

### AI Quick Match — On Every Cat Profile Page
Every cat profile has an embedded chat widget (purple gradient "AI Quick Match" card) that asks 4 lifestyle questions in a conversational interface. In 30 seconds, it calls `/api/counselor` to generate a personalized compatibility preview — lowering the barrier to the full assessment.

### Rich Cat Profiles — 7 Behavior Dimensions
Each cat profile displays: photo gallery with captions, 7 behavior bar charts (energy, sociability, stress sensitivity, handling tolerance, play needs, noise tolerance, vertical space needs), compatibility indicators for children/other cats/dogs, personality trait cards with descriptions, narrative backstory with arrival date, health badges (vaccinated/microchipped/neutered), FIV status, medical notes, ideal home description, shelter info, and a Quick Facts sidebar (breed, color, weight, age, sex, adoption fee).

### 9 Lives Protocol™ — Gamified Post-Adoption Curriculum
14-day journey turning common adoption failure points into achievement milestones:

- Day 1 👻 "The Ghost" — Surviving the hiding phase
- Day 2 🍗 "The Hunger Strike" — Encouraging the first meal
- Day 3 🌙 "The 3 AM Zoomies" — Managing night activity
- Day 4 🚽 "The Litterbox Rebellion" — Solving bathroom issues
- Day 5 🛋️ "The Furniture Test" — Protecting your couch
- Day 6 😺 "The Belly Trap" — Learning cat body language
- Day 7 🪟 "The Window Watcher" — Managing barrier frustration
- Day 8 🏠 "The Scent Swap" — Expanding territory
- Day 9 👑 "The Commander Ascends" — Permanent routine established
- Days 10–14: Maintenance Mode — consolidation phase

Each day unlocks with actionable tips, behavioral explanations, and red-flag warnings.

### AI Coach (Mr. Cat) — Context-Aware Post-Adoption Support

Unlike generic pet advice apps, Mr. Cat is injected with:
- **Full cat behavioral profile** (energy, stress sensitivity, child/dog/cat compatibility, medical needs)
- **Complete check-in history** (eating, litter, hiding, activity, notes across all days)
- **Current adoption day** (what's normal at each stage)
- **Optional photo sharing** — adopter sends a photo, AI describes what it observes

Example: *"I see Barnaby has been eating well (good sign!) but still hiding on Day 3. This is completely normal — let's talk about why..."*

### Daily Check-ins — Structured Behavioral Tracking
Each day, adopters complete 4 toggles (Eating normally? Using litter box? Still hiding? Normal activity?) plus a free-text note. This structured data feeds into the AI coach for context-aware responses and enables pattern detection for Smart Escalation.

### Deterministic Medical Safety Layer (Defense-in-Depth)
26 emergency keywords scanned **before any AI call**. If detected ("not breathing", "seizure", "unconscious", "collapse", "poisoned", "bleeding"), the system returns an immediate medical emergency response without ever contacting the AI. Emergency contact buttons are permanently visible in the coach interface.

### Smart Escalation to Shelter Behaviorists
When concerning patterns emerge (missed check-ins, declining metrics), adopters or the system can escalate: a priority ticket is generated with the last 3 color-coded check-ins, chat context summary, and a 24-hour response timeline badge.

### Shelter Insights Dashboard
- Active adoptions with check-in completion status
- Cats needing attention (sorted by concern severity)
- Common compatibility concerns ranked by frequency
- Data-driven pattern analysis for organizational learning

### Fun Facts Slideshow — 19 Cat Trivia Cards
An auto-rotating carousel on the landing page featuring 19 beautifully designed cards with cat facts spanning history, science, and pop culture: Egyptian cat gods, healing purr frequencies (25-140 Hz for tissue regeneration), unique nose prints, inability to taste sweetness, 70% of life spent sleeping, whisker air-current detection, 32 ear muscles, 6x body-length jumps, Félicette the space cat, Mayor Stubbs of Talkeetna Alaska, reflective eye layer for night vision, 53 vertebrae for flexibility, missing collarbone ("cats are liquid"), meowing evolved for humans, paw-pad sweating, left/right-pawedness, 30 mph sprint speed, Isaac Newton's cat flap invention, and Viking ship cats. Cards auto-rotate every 5 seconds with manual prev/next/pause controls. Designed to educate adopters about cat capabilities and set realistic expectations.

### Whisker Runner Mini-Game
Endless-runner platformer built in Canvas + TypeScript featuring:
- **8-Season Theme Cycle**: Drifts through Beach, Spooky, Spring, Cosmic, Autumn, Rainy, Winter, and the brand-new **City Night Lights 🏙️** theme.
- **Custom Obstacles per Theme**: From falling sakura piles to city traffic cones, metal trash cans, and fire hydrants, each season renders distinct vector obstacles.
- **Structured Difficulty Progression**: Dynamically scales speed and spawn density across four distinct tiers: *Easy*, *Moderate*, *Medium*, and *Hard* (achieved at 3000+ points).
- **Symmetrical Dashboard Layout**: Flanked by a global leaderboard and an interactive Game Guide panel.
- **Guest-Friendly Leaderboard**: Local high scores for non-logged-in players are dynamically injected into the leaderboard with earned medals (🥇🥈🥉) to encourage signup via a global save warning.

### TTS Narration & Accessibility
Compatibility reports feature text-to-speech via Web Speech API for accessibility. The entire app supports dark mode with a warm dark palette, ARIA labels, semantic HTML, and keyboard navigation.

### PWA Support
ForeverHome AI is available as both a **responsive website** and an **installable Progressive Web App**. Add it to your home screen on iOS or Android for a native app-like experience with offline support, custom manifest, and service worker via `@ducanh2912/next-pwa`. No app store required — just visit [forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/) and tap "Add to Home Screen."

---

## 3a. How AI Is Used — Screen by Screen

We follow a **deterministic-first, AI-for-explanation** philosophy. AI never makes the matching decision — it explains structured results in warm, human language.

| Screen | AI Role | API Endpoint | What AI Receives |
|--------|---------|-------------|------------------|
| **Cat Profile** | AI Quick Match widget generates compatibility preview | `POST /api/counselor` | 4 adopter answers + cat breed/name |
| **Assessment → Report** | AI Counselor explains triggered rules, risk level, and mitigation steps in narrative prose | `POST /api/counselor` | Full compatibility result (risk level, all concerns, all strengths) + cat profile + adopter profile |
| **Coach Chat** | AI Coach (Mr. Cat) provides behavioral advice contextualized to this specific cat and adopter | `POST /api/coach` | Cat behavioral profile (all 13 fields) + complete check-in history + current adoption day + message + optional photo |
| **General Help** | General AI assistant for site-wide questions | `POST /api/assistant` | User message |
| **Medical Emergency** | **AI is bypassed entirely** — deterministic keyword match returns immediate emergency response | N/A (intercepted) | 26 emergency keywords scanned pre-AI |

**Why AI explains, but doesn't decide:**
- Matching decisions affect a living being's future — they must be auditable, consistent, and transparent
- Shelters can challenge and adjust deterministic rules; they cannot audit a black-box neural network
- Same inputs always produce the same compatibility result — critical for shelter trust and legal defensibility
- AI hallucination on medical questions is unacceptable — the deterministic safety layer catches emergencies first

**AI Failover:**
```
gemini-3.5-flash → gemini-3-flash-preview → gemini-2.5-flash
With lite variants at each tier. HTTP 429 → 90s rate-limit cooldown.
All tiers exhausted → deterministic fallback response (no AI needed).
```

---

## 3b. Design Decisions & Rationale

### Why No Shelter-Adopter Direct Chat

We intentionally did NOT build messaging between shelters and adopters:

1. **Shelters are severely understaffed** — most operate with 2-5 staff managing hundreds of animals. Real-time chat would create an unsustainable support burden.
2. **Unanswered messages erode trust** — an adopter waiting days for a reply has a worse experience than no chat at all.
3. **AI Coach fills the gap** — Mr. Cat provides instant 24/7 behavioral support that shelters physically cannot.
4. **Escalation is deliberate, not casual** — requiring intentional escalation (rather than casual messaging) ensures shelter staff only see the 10% of cases needing human intervention.
5. **Phone/email for real emergencies** — permanently visible emergency contact in the coach interface for immediate human needs.

**Design trade-off:** AI handles 90% of questions instantly → Smart Escalation surfaces 10% needing humans → shelter staff focus on high-impact interventions.

### Why a Mini-Game (Whisker Runner)

Whisker Runner is strategic, not filler:

1. **Retention & dwell time** — users spend more time on the platform when there's something fun between serious features.
2. **Brand reinforcement** — dodging obstacles and collecting treats mirrors the adoption journey (overcoming challenges, finding rewards).
3. **PWA showcase** — proves the app handles intensive Canvas rendering and keyboard input — it's a real app, not just a form.
4. **Low-friction entry & Guest Engagement** — guests can play instantly without an account, see their scores ranked on the leaderboard with custom medals, and are nudged to log in to save their scores globally.
5. **Technical depth** — features 8 visual themes (including the night skyline of City Night Lights), custom SVG obstacles, an active 4-tier difficulty progression (Easy -> Moderate -> Medium -> Hard), and a clean symmetrical layout flanked by a guide card and leaderboard.

### Why Fun Facts Slideshow

19 animated trivia cards on the landing page serve a specific purpose:

1. **Education disguised as entertainment** — adopters learn about cat hearing, night vision, flexibility, and communication before adopting — setting realistic expectations
2. **Dwell time & engagement** — auto-rotating cards with manual controls keep users scrolling and discovering
3. **Shareability** — "Did you know cats can't taste sweetness?" is inherently shareable content, driving word-of-mouth
4. **Brand personality** — the playful, warm tone of the facts (Mayor Stubbs! Space cat Félicette!) reinforces the app's approachable identity
5. **No account needed** — visible to all visitors, making the landing page valuable even before signup

---

## 4. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router, Turbopack) | 16.2.9 | Full-stack React framework |
| **Language** | TypeScript (strict mode) | 5.x | Type safety across 151 source files |
| **UI Library** | React | 19.2.4 | Component-based UI |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS with custom design tokens |
| **Components** | shadcn/ui | 4.11.1 | Accessible, composable UI primitives |
| **Auth** | Firebase Authentication | 12.15.0 | Email/password + Google sign-in |
| **Database** | Cloud Firestore | 12.15.0 | 10 collections with RBAC |
| **AI** | Google Gemini API (v1beta) | — | 3-tier model failover chain |
| **Token Verification** | jose | 6.2.3 | JWKS validation (no Admin SDK) |
| **Animation** | Framer Motion | 12.42.2 | Page transitions, modals, drawers |
| **PWA** | @ducanh2912/next-pwa | 10.2.9 | Offline support, installable |
| **Testing** | Vitest + fast-check | 4.1.9 + 4.8.0 | Unit, integration, property-based |
| **Linting** | ESLint (next/core-web-vitals) | 9.x | Code quality enforcement |
| **Validation** | zod | 4.4.3 | Schema validation |
| **Notifications** | sonner | 2.0.7 | Toast notifications |
| **Confetti** | canvas-confetti | 1.9.4 | Celebration effects |
| **Lottie** | lottie-react | 2.4.1 | Animation assets |
| **Deployment** | Vercel | — | Edge-optimized hosting |

---

## 5. Technical Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT                                 │
│        Next.js 16 App Router + React 19 + Tailwind CSS v4      │
│                                                                │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │ Cat Browse  │  │  4-Question    │  │  Compatibility      │  │
│  │ (9 profiles)│─▶│  Dynamic       │─▶│  Report + AI        │  │
│  │             │  │  Assessment    │  │  + TTS + Alt Cats   │  │
│  └────────────┘  └────────────────┘  └─────────────────────┘  │
│                                                    │          │
│  ┌─────────────────────────────────────────────┐   │          │
│  │              14-Day AI Coach                 │◀──┘          │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │              │
│  │  │ Daily    │ │ 9 Lives  │ │ Mr. Cat     │  │              │
│  │  │ Check-ins│ │ Protocol │ │ AI Chat     │  │              │
│  │  └──────────┘ └──────────┘ │ (photo too) │  │              │
│  │                            └─────────────┘  │              │
│  │  ┌──────────────────────────────────────┐   │              │
│  │  │        Smart Escalation              │   │              │
│  │  │  (Priority ticket → shelter staff)   │   │              │
│  │  └──────────────────────────────────────┘   │              │
│  └─────────────────────────────────────────────┘              │
│                                                                │
│  ┌──────────────────┐  ┌─────────────────────────────────┐    │
│  │ Shelter Insights  │  │ Whisker Runner Game             │    │
│  │ (Patterns, stats) │  │ (Canvas endless runner + PWA)   │    │
│  └──────────────────┘  └─────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│                        SERVER                                 │
│          Next.js API Route Handlers (server-side only)        │
│                                                                │
│  ┌──────────────────────┐  ┌───────────────────────────────┐ │
│  │ Gemini AI (v1beta)    │  │ Firebase Auth + Firestore     │ │
│  │ • 3-tier model chain  │  │ • 10 collections RBAC        │ │
│  │ • Rate-limit fallback │  │ • jose JWKS verification     │ │
│  │ • 8s timeout per call │  │ • aiLogs (write-only)        │ │
│  │ • Image input support │  │ • UID-enforced isolation     │ │
│  └──────────────────────┘  └───────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                   Security Layer                          ││
│  │  • Medical keywords scan (26 phrases, deterministic)      ││
│  │  • Firebase ID token verification (all protected routes)  ││
│  │  • UID matching (caller.uid === requested.uid)            ││
│  │  • Field type + size validation (Firestore rules)         ││
│  │  • Dependency CVE overrides (serialize-javascript, etc.)  ││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│                    CORE ENGINE (Client)                        │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Compatibility Assessment Engine                       │  │
│  │  • 10 deterministic rules (no AI for matching)         │  │
│  │  • 3 risk tiers: Low / Moderate / High                 │  │
│  │  • Alternative cat auto-recommendations                │  │
│  │  • Non-recursive alt-finding (stack-safe)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Medical Escalation Layer                               │  │
│  │  • 26 emergency keywords (case-insensitive)             │  │
│  │  • Intercepts BEFORE any AI API call                    │  │
│  │  • Immediate deterministic response                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Deterministic compatibility** — No AI in matching decisions. Same inputs always produce the same result. Shelters and adopters see exactly why a concern was flagged. AI is used only to **explain** structured results, never to make the matching decision.

2. **Server-side AI only** — All Gemini API calls happen in Next.js API routes (`src/app/api/`). API keys are never exposed to the browser. The client sends messages to the route, which calls Gemini server-side and returns the response.

3. **Cascading model failover** — 3-tier Gemini model chain with automatic degradation on HTTP 429 rate limits. Rate-limit cache (90-second cooldown) prevents wasted requests on depleted quotas.

4. **Deterministic safety layer** — Medical keywords intercepted before any AI call. Defense-in-depth ensures even if AI hallucinates, emergencies are caught deterministically.

5. **Demo-first development** — Entire app works without Firebase credentials using sessionStorage + 9 static demo cats. Judges can test without setup.

6. **TypeScript strict mode** — Full type safety across 151 source files. No `any` types.

7. **No Firebase Admin SDK** — Token verification via `jose` against Google JWKS, avoiding service account secret management.

### Data Flow — Assessment

```
User → Browse Cats → Select Cat
  → 4 Dynamic Cat-Specific AI Scenarios → Compatibility Engine (client-side)
  → Compatibility Report (risk level + triggered rules + mitigations)
  → Optional: AI Counselor Explanation (server-side API)
  → Alternative Cat Recommendations (if moderate/high risk)
```

### Data Flow — Coach

```
Adopter → Daily Check-in (4 toggles + note)
  → AI Coach Chat (message + optional photo)
  → POST /api/coach → Medical Keywords Check (deterministic)
  → If EMERGENCY: immediate vet advisory response
  → If SAFE: Gemini API with cat profile + check-in history → Response
  → AI Interaction Logged (aiLogs, fire-and-forget)
  → Escalation: SmartEscalationModal → POST /api/escalation
```

### Gemini Model Failover Chain

```
gemini-3.5-flash → (429? → gemini-3.5-flash-lite)
→ gemini-3-flash-preview → (429? → gemini-3-flash-lite-preview)
→ gemini-2.5-flash → (429? → gemini-2.5-flash-lite)
→ deterministic fallback response
```

### Firestore Collections (10 total, RBAC enforced)

| Collection | Access | Purpose |
|-----------|--------|---------|
| `cats` | Public read, Admin write | Cat profiles |
| `users/{uid}` | Self only | User accounts |
| `adopterProfile` | Self only | Adopter profiles |
| `meta` | Self only | Wishlist, preferences |
| `assessments` | Self read/create | Compatibility assessments |
| `adoptions` | Self read, Admin write | Active adoptions + check-ins |
| `matches` | Self read | Compatibility results |
| `aiLogs` | Write-only (users), Admin read | AI interaction logs |
| `escalationReports` | Shelter owner read, field-validated create | Priority reports |
| `adoptionRequests` | Shelter owner read/update, field-validated create | Adoption requests |
| `shelters` | Public read, Admin create/update | Shelter profiles |
| `shelterReviews` | Public read, Author create/update | Shelter reviews |

---

## 6. Testing Matrix

**22 test suites** covering deterministic correctness, integration flows, and edge cases — with **fast-check** for property-based testing:

| Feature / Flow | Steps | Expected Result | Pass |
|---------------|-------|----------------|------|
| **Compatibility — rules property test** | Generate 10,000 random adopter × cat combos; verify all 10 rules trigger correctly | Every rule triggers when conditions met; no false positives | ✅ |
| **Compatibility — rules edge cases** | Test each rule with null fields, boundary values, missing data | Engine handles gracefully; no crashes on missing fields | ✅ |
| **Compatibility — engine invariants** | Verify overall engine behavior: level monotonicity, concern count bounds | Risk never decreases when concerns increase; count always within bounds | ✅ |
| **Compatibility — engine API** | `assessCompatibility(cat, adopter)` with known fixtures | Returns correct risk level, concerns array, strengths array | ✅ |
| **Coach — prompt integrity** | Generate random check-in data; verify AI prompt structure | Prompt always contains cat profile, check-in history, current day | ✅ |
| **Coach — edge cases** | Medical keywords in messages, empty messages, image handling | Medical keywords trigger emergency; empty messages handled; images passed correctly | ✅ |
| **Coach — fallback mechanism** | Simulate Gemini unavailable; verify fallback response | Deterministic fallback covers all message patterns without AI | ✅ |
| **Check-in — data validation** | Create check-ins across all 14 days with random data | Day boundaries correct; progress math accurate; validation catches invalid data | ✅ |
| **Check-in — full lifecycle** | Create → update → verify complete adoption flow | Data persists correctly; updates reflect; verification matches stored state | ✅ |
| **Medical escalation** | All 26 keywords tested — case insensitive, partial matches | Every keyword immediately returns emergency response; no AI call made | ✅ |
| **Medical escalation — negatives** | Normal messages (no keywords) | Pass through to AI normally; no false positives | ✅ |
| **Demo cats — data integrity** | Validate all 9 demo cats | All required fields present; enum values valid; no null data | ✅ |
| **Game — collision detection** | Cat sprite vs obstacles at various positions | Collision detected at correct boundaries; no false collisions | ✅ |
| **Game — scoring** | Run game with known obstacle sequences | Score increments correctly; high score updates in order | ✅ |
| **Game — obstacle progression** | Run game for extended duration | Difficulty increases progressively; obstacles within screen bounds | ✅ |
| **Game — RNG determinism** | Same seed → same obstacle sequence | Deterministic output for reproducible levels | ✅ |
| **Game — high score storage** | Add scores, verify sorting, limits | Top scores sorted; storage limit enforced; persistence works | ✅ |
| **Error handling** | Network failures, timeouts, retries, edge values | Graceful degradation; user-friendly error messages; no uncaught exceptions | ✅ |
| **Accessibility** | ARIA labels, semantic HTML, alt text, labeling patterns | All interactive elements labeled; navigation structure valid | ✅ |
| **UI — game dialog** | Open/close Whisker Runner dialog | Opens correctly; game starts; close returns to previous view | ✅ |
| **UI — sprite rendering** | CatSprite + ObstacleSprite rendering at various frame positions | Correct frame rendered for each game state | ✅ |
| **UI — report page** | Navigate to report with valid match ID | Risk badge displayed; triggered rules shown; mitigation steps present | ✅ |

---

## 7. Future Improvements

If we had another week:

1. **Multi-cat household compatibility** — Currently the assessment evaluates a single cat against an adopter. We'd extend the engine to model interactions between existing resident cats and a prospective addition (territory dynamics, resource competition).

2. **Firebase App Check** — Add reCAPTCHA/DeviceCheck enforcement on Firestore to prevent unauthorized client access even with stolen API keys.

3. **CSP headers + helmet middleware** — Content Security Policy headers in `next.config.ts` for defense-in-depth XSS protection.

4. **Firestore Security Rules unit tests** — Automate validation of Firestore RBAC rules in CI so every rule change is verified against access patterns.

5. **AI-powered cat profile generation** — Shelter staff upload a photo + notes; Gemini generates a rich behavioral profile (energy level, stress sensitivity, quirks, ideal home). Saves hours of manual data entry.

6. **Push notifications for adopters** — Remind adopters to complete daily check-ins via Web Push API (service worker already in place via PWA).

7. **Shelter-to-shelter cat transfer matching** — When one shelter is overcrowded, automatically find capacity at nearby shelters with compatible demographics.

8. **Adoption timeline analytics** — Track which compatibility rules most frequently predict returns, allowing shelters to tune rules based on real outcomes.

9. **Multi-language support** — Translate the assessment, protocol, and AI responses for non-English-speaking adopters.

10. **Automated dependency scanning in CI** — Add Dependabot or Snyk to catch new CVEs automatically rather than relying on periodic Aikido scans.

---

## 8. Tools You Used

| Tool | Purpose |
|------|---------|
| **Cursor / AI Coding Assistant** | Accelerated development, code generation, test writing, refactoring |
| **Aikido Security** | Automated security vulnerability scanning, CVE detection, Firestore rule analysis |
| **Figma** (design system) | Color palette, typography selection, component spacing, dark mode variants |
| **Vercel** | Deployment, edge hosting, environment variable management |
| **Google AI Studio** | Gemini API testing, prompt iteration, model comparison |
| **Firebase Console** | Firestore data modeling, security rules testing, auth configuration |
| **Chrome DevTools** | Performance profiling, accessibility audit, PWA manifest verification |
| **Git / GitHub** | Version control, collaboration |

---

## 9. Learnings & Takeaways

**Technical Learnings:**

1. **Deterministic engines inspire more trust than AI** — The compatibility assessment resonates with shelters *because* it's transparent. They can challenge and adjust rules. Black-box AI matching would face immediate rejection in animal welfare.

2. **Property-based testing catches real bugs** — fast-check found edge cases we never would have written manually (null fields in Firestore bypassing `==` comparisons, adopter profiles missing specific enum values). These became Aikido findings that we remediated.

3. **Demo-first architecture pays off** — Building the entire app to work without Firebase (sessionStorage fallback + static data) meant judges could test instantly. It also forced clean separation of concerns — no Firestore dependency bleeding into UI components.

4. **Server-side AI is non-negotiable for security** — API keys in the browser would be an instant disqualification. The API route proxy pattern (client → Next.js route → Gemini) is simple and secure.

5. **jose over Firebase Admin SDK** — Verifying Firebase ID tokens with `jose` against Google's public JWKS avoids managing service account secrets entirely. It's lighter, more portable, and eliminates a whole class of credential-leak risks.

6. **Firestore rules need `is string` guards** — The Aikido scan caught that `resource.data.adopterUid == request.auth.uid` can be bypassed with null values (null == null is true in Firestore rules). Type guards are essential even in security rules.

**Product Learnings:**

7. **The 9 Lives Protocol works because it's specific** — Generic "be patient" advice doesn't help. Naming each day's challenge ("The Ghost", "The Hunger Strike") gives adopters a shared vocabulary and makes the invisible struggle visible.

8. **Medical safety isn't optional** — AI coaches for pets will encounter medical questions. A deterministic pre-scan is the only responsible approach. 26 keywords handled 100% of the concerning inputs we tested.

---

## 10. Acknowledgments

- **Google Gemini API** — for powering the AI coach and counselor with 3-tier failover reliability
- **Firebase** — for authentication, Firestore database, and security rules
- **shadcn/ui** — for the clean, accessible component primitives
- **fast-check** — for property-based testing that caught real edge cases
- **Aikido Security** — for the automated vulnerability scan that identified 8 findings (all now remediated)
- **Vercel** — for Next.js hosting and edge deployment
- **Framer Motion** — for smooth, production-quality animations
- **jose** — for lightweight Firebase token verification without the Admin SDK
- **@ducanh2912/next-pwa** — for PWA support with offline capability
- **The open-source Next.js and React communities** — for the framework, documentation, and ecosystem
- **Cat shelters everywhere** — for the work you do and the cats you save

---

## Submission Checklist

- [x] Video demo (HD or at least 720p)
- [x] README.md (prerequisites, run instructions, configuration)
- [x] Project report (this document, in `docs/`)
- [x] Aikido security scan screenshot (`aikido.scan.jpeg` in repo root) — all 9 findings resolved
- [x] Source code in `src/`
- [x] No unrelated files, executables, auto-generated code, or package folders (`node_modules/`, `build/`, `dist/`, `vendor/`)
