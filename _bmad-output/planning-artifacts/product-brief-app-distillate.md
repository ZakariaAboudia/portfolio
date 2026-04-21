---
title: "Product Brief Distillate: Developer Portfolio — SaaS Dashboard"
type: llm-distillate
source: "product-brief-app.md"
created: "2026-04-05"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Developer Portfolio — SaaS Dashboard

## Identity & Positioning

- Developer identity: "The glue dev" — backend-leaning full-stack who connects DB → API → background jobs → UI into one cohesive system
- Backend specialization: Go and PHP (APIs, background jobs)
- Frontend specialization: React, Next.js
- NOT framework-first identity — role-first: the person who owns the full stack
- Headline framing must lead with role, not technology
- Primary optimization target: employer-facing (job applications, interviews)
- Secondary audience: freelance clients (v1 CTA only, full optimization deferred)

## Technical Stack (Confirmed)

- Framework: Next.js (App Router assumed, confirm during architecture)
- Maps: Mapbox GL JS
- Charts: Recharts or Chart.js (not yet decided — both acceptable)
- Auth: NextAuth with OAuth provider (not username/password — "better auth" explicitly requested)
- i18n: next-intl or equivalent (infrastructure in v1, English content only)
- Styling: not specified — CSS variables required for dark mode implementation
- Database: not specified — admin panel implies persistent storage, to be decided in architecture

## Feature Details

### Sidebar Navigation
- Pages: Overview, Projects, Skills, Experience, Contact
- Behavior: collapsible, responsive, keyboard-accessible
- Styled as a real SaaS product nav, not a top navbar

### Overview Page (Critical Constraint)
- Must be immediately legible to a non-developer within 5 seconds
- Readable by HR / non-technical hiring managers without feeling lost
- Clear "who this is, what they do, what to do next" — dashboard complexity lives behind this, not on it
- This is the most important UX constraint in v1

### Mapbox Integration
- Purpose: show global project/client locations — serves as live skill demo, not decoration
- Client confidentiality: 2 international clients who do not want names shared
- Solution: anonymized pins with sector/region labels (e.g. "E-commerce platform, Netherlands") — location is the story, not the name
- Personal projects and open source can fill remaining pins
- Map is proof-of-capability, not just visual flair

### Charts / Data Visualization
- Visualize: tech stack depth, years of experience by domain, project volume over time
- Serve as live demo of data viz capability

### Dark Mode
- Default: system preference (`prefers-color-scheme`)
- Override: manual toggle persisted (localStorage or cookie)
- Implementation: CSS variables — not class-swap hacks

### Admin Panel
- Separate authenticated section (not a third-party CMS)
- Auth: NextAuth with OAuth (e.g. Google or GitHub — provider TBD)
- CRUD for: projects, skills, timeline/experience entries
- No hardcoded content anywhere in the public portfolio
- **Guest / read-only demo mode**: visitors can explore the admin UI without credentials
  - Security requirements (explicitly raised by user — "curious devs will try to break it"):
    - Write operations enforced server-side (not just UI-disabled)
    - Rate limiting on all endpoints
    - No sensitive data exposed in guest mode
    - Guest session must be clearly sandboxed — cannot escalate to real write access
    - This is a security feature, not just a UX nicety — must be treated as such in architecture

### i18n
- Infrastructure: in v1 (next-intl or equivalent, all strings externalized)
- Content translations: NOT in v1 — English only at launch
- Goal: add a new language later without a rewrite
- Constraint: i18n architecture must not add friction to content management via admin panel

### CV / Resume
- Downloadable CV/resume link required — employer expectation
- Format: PDF download (format not specified but implied)

### Public GitHub Repo
- Portfolio codebase to be open-sourced
- Serves as transparency signal and secondary technical credibility proof
- Technical interviewers may review the code directly

## Out of Scope for v1 (Do Not Re-Propose)

- Additional language translations (infra yes, content no)
- Blog or long-form writing section
- Freelance conversion flows: testimonials, pricing, packages, inquiry funnels
- Analytics dashboard ("ironic but out of scope" — user's words)
- Real-time features of any kind
- A/B testing or personalization

## Success Metrics

- Higher callback rate on job applications that include portfolio link (baseline = current callback rate, pre-launch)
- Technical interviewers can validate full-stack claims via codebase or admin demo
- Admin panel enables content updates without code changes (freshness test: no stale content at 6 months)
- Lighthouse score ≥ 90 across all categories
- At least one inbound freelance inquiry within 60 days of launch (secondary, nice-to-have)

## Open Questions (To Resolve in PRD / Architecture)

- Which OAuth provider for NextAuth? (Google, GitHub, or other)
- Database choice for admin panel persistence (PostgreSQL? SQLite? hosted vs. self-managed?)
- Chart library final selection: Recharts vs Chart.js (performance vs. API ergonomics tradeoff)
- Deployment target: Vercel? Self-hosted Docker? (Dockerfile already exists in project root — self-hosting may be intended)
- Guest admin demo: separate demo-data seed or a read-only view of real (sanitized) data?
- CV format and update flow — is the PDF managed via admin panel or a static file?

## Competitive Context

- Most developer portfolios: static HTML, framework list, project grid, contact form — generic, undifferentiated
- SaaS dashboard format: rare among developer portfolios — strong differentiator
- Admin-driven portfolio: signals production-grade thinking (maintainability over launch velocity)
- Open-source portfolio codebase: additional trust signal for technical evaluators

## Future Vision (Not v1 — Captured for Context)

- Multilingual content (non-English markets)
- Freelance optimization layer: testimonials, case studies, inquiry flow
- Potential open-source template / starter for other full-stack developers to fork
