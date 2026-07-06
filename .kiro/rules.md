# Kiro Project Rules — ForeverHome AI

These rules were established early in development and guided Kiro's code generation consistently across all sessions.

---

## 1. Architecture Rules

```yaml
architecture:
  pattern: "Next.js 16 App Router with server-first rendering"
  no: ["Pages Router", "getServerSideProps", "getStaticProps"]
  yes: ["Server Components by default", "'use client' only when needed"]

  state_management: "React Context (AuthContext) + sessionStorage fallback"
  no: ["Redux", "Zustand", "global state library"]

  ai_integration:
    endpoint: "Next.js API Routes (/api/*)"
    no: ["Direct Gemini calls from client", "API keys in browser"]
    yes: ["Bearer token auth on API routes", "jose JWT verification"]

  database:
    primary: "Firestore"
    fallback: "sessionStorage (for demo/unauthenticated flows)"
    no: ["Raw SQL", "Prisma", "Drizzle"]

  validation:
    runtime: "zod schemas"
    compile_time: "TypeScript strict mode"
```

## 2. Security Rules

```yaml
security:
  csp: "Strict Content-Security-Policy headers via next.config.ts"
  auth: "Firebase Auth with server-side token verification (jose + JWKS)"
  firestore: "Security rules enforce ownership and role-based access"
  no: ["API keys in client code", "unvalidated user input", "eval()"]
  dependencies: "No known CVEs (verified by Aikido scan)"
  headers: ["X-Content-Type-Options: nosniff", "X-Frame-Options: DENY"]
```

## 3. Code Quality Rules

```yaml
code_quality:
  typescript: "Strict mode enabled, no `any` without explicit reason"
  linting: "ESLint next/core-web-vitals"
  imports: "Use `@/` path aliases always, no relative `../../` chains"
  exports: "Named exports preferred over default exports (except Next.js pages)"
  components: "One component per file, co-located types in same file if small"
  naming:
    components: "PascalCase"
    hooks: "useCamelCase"
    lib: "camelCase"
    types: "PascalCase"
    files: "kebab-case for utilities, PascalCase for components"
```

## 4. UI / Design System Rules

```yaml
design:
  framework: "Tailwind CSS v4"
  component_library: "shadcn/ui (customized with cat theme)"
  palette:
    primary: "terracotta (#E07A5F)"
    dark: "cat-dark (#3D2C2E)"
    accent: "sunny (#F4D06F) + heart (#E07A5F)"
    bg: "warm-cream (#FFF8F0)"
  font: "Nunito (headings + body)"
  animations: "Framer Motion for page transitions, Tailwind for micro-interactions"
  responsive: "Mobile-first, breakpoints at sm(640), md(768), lg(1024)"
  accessibility: "role attributes, aria-labels, focus-visible outlines, semantic HTML"
```

## 5. AI Integration Rules

```yaml
ai:
  model_chain:
    counselor: "gemini-3.5-flash → gemini-3-flash-preview → gemini-2.5-flash"
    coach: "gemini-3.5-flash → gemini-3-flash-preview → gemini-2.5-flash"
    assistant: "gemini-3.5-flash → gemini-3-flash-preview → gemini-2.5-flash"
  strategy: "model-outer (exhaust best model on all keys, then fall back)"
  rate_limiting: "Per-model+key 429 cache (90s TTL), skip exhausted combos"
  safety:
    pre_scan: "26 medical emergency keywords → deterministic redirect"
    guardrails: "Never diagnose, never prescribe, always escalate to vet"
  no: ["Free-quota models (2.0-flash, 2.5-pro)", "unfiltered AI output"]
```

## 6. Testing Rules

```yaml
testing:
  framework: "Vitest"
  coverage_target: "Core logic only (compatibility engine, game engine, security rules)"
  property_based: "fast-check for compatibility scoring and game mechanics"
  no: ["Snapshot tests", "E2E tests (time constraint)"]
  run: "npx vitest run"
  ci: "Tests must pass before commit"
```

## 7. Git Rules

```yaml
git:
  commits: "Conventional commits (feat:, fix:, docs:, chore:, test:)"
  no: ["Force push to main", "amend after push", "skip hooks"]
  branch: "main only (hackathon time constraint)"
```

## 8. Demo-First Philosophy

```yaml
demo:
  requirement: "App must work WITHOUT Firebase setup for judge evaluation"
  strategy: "sessionStorage fallback + static cat data + synthetic user docs"
  graceful_degradation: "Show demo data, never crash on missing Firebase"
  auth: "Allow guest access to assessment, coach, and game"
```
