# #HackTheKitty 2026 — Project Report

**Project Name:** ForeverHome AI  
**Reference ID:** 7WYRJRX3  
**Deployment:** [https://forever-home-ai.vercel.app/](https://forever-home-ai.vercel.app/) (Website + PWA)

---

## 1. Executive Summary

ForeverHome AI serves as an intelligent matching system designed to minimize adoption reversals by pairing felines with suitable owners via methodical compatibility evaluations. Furthermore, the tool offers tailored support throughout the initial two-week transition period to ensure sustainable bonding and successful integration.

With **7–20% of shelter cats returned within 6 months** — usually due to preventable mismatches rather than behavioral problems — ForeverHome AI addresses this at every stage of the adoption journey:

- **Pre-Adoption**: A 10-question deterministic compatibility assessment flags risk areas (noise sensitivity, energy mismatch, medical needs) and automatically recommends better-matched alternatives
- **Post-Adoption**: A gamified 14-day curriculum called the **9 Lives Protocol™** guides adopters through common challenges (hiding, not eating, zoomies), while an AI Coach (Mr. Cat) provides cat-specific contextual advice
- **Safety**: A deterministic medical escalation layer with 26 emergency keywords intercepts urgent situations before any AI call, routing them to immediate human attention
- **Shelter Side**: An insights dashboard helps staff track adoptions, identify concerning patterns, and prioritize cats needing attention

The system was built in **151 TypeScript files** using Next.js 16, Firebase, and Google Gemini AI — with a **deterministic-first philosophy**: AI explains results but never makes the matching decision itself. The application is deployed at **[forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/)** and available as both a responsive website and an installable Progressive Web App (PWA) with offline support.

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
| **Shelter staff / behaviorists** | Standardized compatibility assessments, adoption tracking, concern pattern detection, smart escalation queue |
| **Prospective adopters** | Browse cats with rich behavioral profiles, take the 10-question quiz, get transparent compatibility results with alternatives |
| **Recent adopters** | Daily check-ins, gamified 14-day curriculum, AI Coach (Mr. Cat) with cat-specific behavioral advice, photo sharing |
| **Shelter admins / directors** | Insights dashboard — active adoptions, cats needing attention, common compatibility concerns by frequency |
| **General public (guest mode)** | Full demo without login — browse cats, take assessment, see report with TTS narration, play Whisker Runner |

---

## 3. Key Features

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

### Deterministic Medical Safety Layer (Defense-in-Depth)
26 emergency keywords scanned **before any AI call**. If detected ("not breathing", "seizure", "unconscious", "collapse", "poisoned", "bleeding"), the system returns an immediate medical emergency response without ever contacting the AI. Emergency contact buttons are permanently visible in the coach interface.

### Smart Escalation to Shelter Behaviorists
When concerning patterns emerge (missed check-ins, declining metrics), adopters or the system can escalate: a priority ticket is generated with the last 3 color-coded check-ins, chat context summary, and a 24-hour response timeline badge.

### Shelter Insights Dashboard
- Active adoptions with check-in completion status
- Cats needing attention (sorted by concern severity)
- Common compatibility concerns ranked by frequency
- Data-driven pattern analysis for organizational learning

### Whisker Runner Mini-Game
Endless-runner platformer built in Canvas + TypeScript: custom cat sprite animations (run, jump, idle, hit, celebration), progressive obstacle difficulty, deterministic RNG for reproducible levels, high score persistence.

### TTS Narration & Accessibility
Compatibility reports feature text-to-speech via Web Speech API for accessibility. The entire app supports dark mode with a warm dark palette, ARIA labels, semantic HTML, and keyboard navigation.

### PWA Support
ForeverHome AI is available as both a **responsive website** and an **installable Progressive Web App**. Add it to your home screen on iOS or Android for a native app-like experience with offline support, custom manifest, and service worker via `@ducanh2912/next-pwa`. No app store required — just visit [forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/) and tap "Add to Home Screen."

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
│  │ Cat Browse  │  │  10-Question   │  │  Compatibility      │  │
│  │ (9 profiles)│─▶│  Assessment    │─▶│  Report + AI        │  │
│  │             │  │  Quiz          │  │  + TTS + Alt Cats   │  │
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
User → Browse Cats → Select Cat → 5 Lifestyle Questions
  → 5 Scenario Questions → Compatibility Engine (client-side)
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
- [x] Source code in `src/`
- [x] No unrelated files, executables, auto-generated code, or package folders (`node_modules/`, `build/`, `dist/`, `vendor/`)
