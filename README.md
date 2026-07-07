# 🐾 ForeverHome AI

> **Built for [#HackTheKitty 2026](https://hackthekitty.com/) — World Cat Domination Day Hackathon**
>
> **Reference ID:** `7WYRJRX3` &nbsp;|&nbsp; **🌐 [Live App →](https://forever-home-ai.vercel.app/)** — Website + installable PWA

**Preventing cat returns before they happen — through AI-powered compatibility assessment and post-adoption coaching.**

![ForeverHome AI](public/cat.png)

---

## 🎯 The Problem

**7–20% of shelter cats are returned within 6 months** — not because they're "unadoptable," but because of preventable mismatches between a cat's needs and an adopter's lifestyle. New adopters panic at normal adjustment behaviors (hiding, not eating) because no one explained what to expect.

---

## 💡 Our Solution

ForeverHome AI is a **decision-support and adopter-education platform** for shelters:

| Stage | Feature | AI Role |
|-------|---------|---------|
| **Pre-Adoption** | 11-question compatibility quiz (6 lifestyle + 5 scenario) + 4 dynamic AI-generated cat-specific scenarios → deterministic rules engine | AI generates questions & explains the report |
| **Pre-Adoption** | AI Quick Match — 4-question chat widget on every cat profile | AI counselor gives instant compatibility preview |
| **Post-Adoption** | **9 Lives Protocol™** — 14-day gamified curriculum (Ghost → Hunger Strike → Commander Ascends) | No AI — expert-written behavioral content |
| **Post-Adoption** | **AI Coach (Mr. Cat)** — contextual advice injected with cat profile + quiz data + check-in history | Chat AI: parallel-race Gemini models |
| **Safety** | **26 emergency keywords** intercepted deterministically before any AI call | **AI bypassed** — immediate emergency response |
| **Shelter Side** | Insights dashboard, cat inventory CRUD, adoption request tracking, smart escalation queue | No AI — admin tools |
| **Engagement** | Whisker Runner mini-game, Fun Facts Slideshow (19 cards), TTS narration | No AI |

**Core philosophy**: The compatibility engine is deterministic and transparent — AI **explains** results but never **decides** matching. Medical emergencies are caught by deterministic rules before any AI call.

### Account Required

Users must register (Google OAuth or Email) and complete a 12-field onboarding profile before accessing any tools — lifestyle data is critical to compatibility matching, and the 14-day coach requires persistent check-in history.

### Key Design Decisions

1. **Deterministic matching** — 10 transparent rules, no AI in decisions
2. **Server-side AI only** — Gemini API keys never exposed to browser
3. **Parallel race model strategy** — All models × all keys fire simultaneously; first to respond wins
4. **No shelter-adopter chat** — Shelters lack staffing; AI handles 90% of questions; Smart Escalation surfaces the 10% needing humans
5. **Privacy-first AI logging** — Write-only `aiLogs` collection, no full conversations stored

---

## 🏗️ Architecture

```
CLIENT: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
  Cat Browse → 11-Question Quiz → Deterministic Rules Engine → Report + AI + TTS
  → 14-Day AI Coach (Daily Check-ins + 9 Lives Protocol + Mr. Cat Chat)
  → Smart Escalation → Shelter Staff
  └─ Whisker Runner Game (Canvas) + Shelter Insights

SERVER: Next.js API Routes (never client)
  Gemini AI (v1beta, parallel race, 2 keys) + Firebase Auth + Firestore (12 collections RBAC)
  Security: jose JWKS verification, UID matching, 26-keyword medical pre-scan
```

Full details: **[docs/architecture.md](docs/architecture.md)**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode, 151 source files) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (12 collections, RBAC) |
| AI | Google Gemini API (v1beta, parallel race across 2 API keys) |
| Testing | Vitest + fast-check (22 suites, property-based) |
| Deployment | Vercel (PWA via @ducanh2912/next-pwa) |

---

## 🔬 Testing

**22 test suites** with property-based testing (fast-check) covering the deterministic compatibility engine, coach prompt integrity, medical escalation (all 26 keywords), game engine collision/scoring, accessibility patterns, and more.

```bash
npm test           # Watch mode
npm run test:run   # Single run
```

---

## 🔐 Security

- **Aikido scan**: 9 findings → all remediated (3 CVE overrides, 2 IDOR fixes, XSS redirect, path traversal, access control)
- Firestore RBAC: 12 collections with UID matching, `is string` + `size()` guards
- Medical safety: 26 keywords intercepted pre-AI
- Full review: **[docs/security.md](docs/security.md)**

---

## 🎨 UX

Warm cat-focused palette (terracotta, cocoa, cream, sage), dark mode, Framer Motion animations, PWA installable on iOS/Android, TTS report narration for accessibility.

---

## 🚀 Getting Started

### Live
**[forever-home-ai.vercel.app](https://forever-home-ai.vercel.app/)** — Full demo works in guest mode without an account.

### Local
```bash
git clone https://github.com/yuno0006/foreverhome-ai.git
cd foreverhome-ai
npm install
```

Create `.env.local` with Firebase + Gemini keys (see `.env.example`), then:

```bash
npm run dev      # http://localhost:3000
npm run build    # Production build
```

---

## 📁 Documentation

| Document | Content |
|----------|---------|
| [**Architecture**](docs/architecture.md) | System design, data flow, database schema, design decisions |
| [**Project Report**](docs/project-report.md) | Executive summary, features, testing matrix, learnings, submission checklist |
| [**API Reference**](docs/api.md) | Endpoint schemas, request/response examples, error codes |
| [**Data Model**](docs/data-model.md) | Complete TypeScript types + Firestore field reference |
| [**Security**](docs/security.md) | OWASP Top 10 coverage, Aikido scan report, RBAC rules |
| [**Kiro IDE Usage**](.kiro/README.md) | AI-assisted development stats, design decisions, session memories, project rules |

---

## 🗺️ Judge Walkthrough (60s)

Account required → Register/login → complete onboarding → then:

| Step | Route | What to See |
|------|-------|------------|
| 1 | `/` | Landing — animated cat cards, marquee, Fun Facts (19 cards) |
| 2 | `/cats` | Browse 9 cats with profiles → click any |
| 3 | `/cats/barnaby` | Cat profile with 7 behavior bars, AI Quick Match widget |
| 4 | `/assessment/barnaby` | 11-question compatibility quiz (6 lifestyle + 5 scenario + 4 dynamic AI questions) |
| 5 | `/report/[matchId]` | Risk badge, triggered rules, AI explanation, TTS, alt cats |
| 6 | `/coach/barnaby-adoption-1` | 9 Lives timeline, daily check-in, Mr. Cat AI chat with photo upload |
| 7 | `/insights` | Shelter-side patterns and concern analysis |
| 8 | Whisker Runner | Mini-game from header menu |

---

## ⚠️ Disclaimer

> **ForeverHome AI is not a replacement for shelter professionals or veterinarians.** It is a decision-support and education platform. The compatibility engine is transparent and rule-based — it does not predict outcomes, diagnose behavior, or make adoption decisions. AI is used only to explain structured results. Medical concerns are intercepted deterministically and escalated to humans.

---

## 🐱 World Cat Domination Day

Every forever home is a new base of operations. When cats are properly matched, supported through their transition, and monitored by shelters — they don't just survive. They thrive. And from every secure, loving home, one more cat peacefully rules their domain.

**#HackTheKitty 2026**
