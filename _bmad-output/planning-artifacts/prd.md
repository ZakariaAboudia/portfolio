---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-app.md"
  - "_bmad-output/planning-artifacts/product-brief-app-distillate.md"
workflowType: 'prd'
briefCount: 2
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
  authLibrary: BetterAuth (OAuth, email allowlist enforced server-side post-OAuth)
  uiStyle: hand-drawn / sketch aesthetic, Level 2
---

# Product Requirements Document - app

**Author:** Root
**Date:** 2026-04-05

## Executive Summary

A personal developer portfolio structured and styled as a SaaS dashboard — built to prove full-stack capability by demonstrating it, not describing it. Primary audience: hiring managers and technical leads evaluating candidates for full-stack or backend-leaning roles. Secondary audience: freelance clients assessing end-to-end project ownership.

The portfolio addresses a specific failure mode in developer self-presentation: a developer capable of building integrated, production-grade systems is indistinguishable on paper from someone who completed tutorials. The portfolio solves this by making itself the evidence — the architecture, the admin panel, the live integrations, and the intentional aesthetic all function as proof of work.

**What makes it special:** Two forces work together. The SaaS dashboard structure (sidebar navigation, Mapbox integration, data visualizations, OAuth-authenticated admin panel with guest demo mode) demonstrates systems thinking — database to API to UI — in a format rarely seen among developer portfolios. A hand-drawn / sketch aesthetic (Level 2: Rough.js borders, sketchy chart rendering, styled map pins) signals personality and craft, preventing the portfolio from reading as a cloned template.

The core value is felt through structure, not stated in copy. A visitor who explores the Overview page, clicks into the admin demo, and inspects the Mapbox map arrives at the conclusion independently: this developer builds real things. No explanatory headline required.

Content is fully admin-driven (no hardcoded data), with i18n infrastructure in place from launch — both signals of production-grade thinking over launch-and-forget execution.

**Classification:** Web App (Next.js SSR/SPA) · General domain · Medium complexity · Greenfield · BetterAuth + OAuth · Hand-drawn aesthetic Level 2

## Success Criteria

### User Success

- A non-technical visitor (HR, hiring manager) lands on the Overview page and identifies who this developer is, what they do, and what to do next within 5 seconds — no dashboard complexity on the surface
- A technical interviewer can explore the full guest admin demo without hitting errors, broken states, or security gaps — the demo itself is a credibility signal
- Any visitor on mobile has a fully functional (not just readable) experience across all pages

### Business Success

- Applications including the portfolio link produce a noticeably higher callback rate than pre-launch — no hard baseline exists; tracked subjectively per application batch
- Lighthouse score ≥ 90 across all four categories (Performance, Accessibility, Best Practices, SEO) at launch
- Portfolio content remains current at 6 months post-launch — admin panel makes updates fast enough that there's no excuse not to
- At least one inbound freelance inquiry within 60 days of launch *(nice-to-have)*

### Technical Success

- All admin write operations blocked server-side for guest sessions — UI state alone is never the enforcement mechanism
- Rate limiting applied to all endpoints; guest session cannot escalate to real write access under any circumstance
- Contact endpoint protected by honeypot + rate limiting + Cloudflare Turnstile — no bot submissions reach delivery
- i18n infrastructure supports adding French (and future languages) with zero architectural changes — only content work required
- Admin panel supports translatable content fields from day one
- No hardcoded portfolio content anywhere in the public-facing codebase

## User Journeys

### Journey 1 — Sarah, Hiring Manager (Primary — Success Path)

Sarah is a hiring manager at a 60-person product startup. She's reviewing twelve applications for a senior full-stack role. Most portfolios she opens look the same: a hero section, a grid of project cards, a GitHub link. She gives each about 45 seconds before moving on.

She opens this portfolio link. The Overview page loads — clean, direct, hand-drawn aesthetic that immediately reads as intentional rather than template-picked. She sees who this developer is and what they do in under five seconds. There's no wall of technology names. There's a sidebar that behaves like a real product nav. She clicks Projects, then Skills — the charts are hand-sketched, readable, a little unusual. She notices the Mapbox map and hovers over a pin: *"E-commerce platform, Netherlands."* She didn't expect that.

She clicks the Admin link expecting a login wall. Instead she's dropped into a live read-only demo of the admin panel. She can browse projects, skills, timeline entries. She can see the structure. She doesn't need to understand the code to understand that someone built this properly.

She hits Contact, writes two sentences, submits. It works. No CAPTCHA puzzle, no friction. She moves this application to the interview pile.

**Capabilities revealed:** Overview page clarity, sidebar navigation, Mapbox with anonymized pins, data visualizations, guest admin demo with seamless entry, contact form with bot protection transparent to real users.

---

### Journey 2 — Marcus, Technical Lead (Primary — Deep Dive)

Marcus is a technical lead who's already screened this developer by phone. He's been sent the portfolio link before the technical interview to prep. He's not checking for aesthetics — he's checking for evidence.

He opens the admin panel guest demo and immediately starts probing. He tries submitting a form — blocked. He opens DevTools and looks at the network tab. He tries a direct API call to a write endpoint. Rate limited, session validated server-side. He nods. He opens the GitHub repo link, scans the project structure, reads the auth middleware. He checks the i18n setup. He sees `next-intl` with externalized strings from day one — not bolted on.

He comes to the interview with specific questions: *"Why BetterAuth over NextAuth?"*, *"How did you handle the guest session sandboxing?"* The portfolio turned a generic interview into a technical conversation.

**Capabilities revealed:** Server-enforced write blocking, rate limiting, public GitHub repo, BetterAuth implementation quality, i18n architecture visible in code.

---

### Journey 3 — The Developer, Admin (Owner — Content Update)

Three months after launch, a new project ships. The developer opens the admin panel on a Sunday, logs in via Google OAuth — one click, lands in the dashboard. Adds the new project: title, description, tech stack, client region (anonymized), project date. Saves.

The public portfolio reflects the change immediately. No git commit, no deployment, no code change. The skills chart updates from the new project's tech stack tags. The Mapbox map has a new pin.

**Capabilities revealed:** OAuth login (email allowlist), full CRUD for projects/skills/timeline, real-time public reflection of admin changes, no-code content management, translatable content fields ready for French.

---

### Journey 4 — Youssef, Freelance Client (Secondary — Cautious Evaluator)

Youssef runs a small e-commerce business in France. A mutual contact mentioned a developer who built something similar for another client. He finds the portfolio on his phone — doesn't understand half the technical language, but the Overview page is clear enough: full-stack developer, builds complete systems, international project experience.

He scrolls to Contact. He writes in French. The form accepts it — the interface is in English but there's no barrier to writing in his language. He submits. No robot puzzle, no error.

*(In a future iteration, the interface is in French — the infrastructure is already there.)*

**Capabilities revealed:** Contact form with i18n-ready labels, bot protection invisible to real users, mobile-responsive layout, no language barrier in the contact flow.

---

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Overview page — 5-second legibility | Sarah, Youssef |
| Sidebar navigation, all pages functional | Sarah, Marcus |
| Mapbox with anonymized pins | Sarah |
| Data visualizations (charts) | Sarah |
| Guest admin demo — seamless, no login required | Sarah, Marcus |
| Server-enforced write blocking + rate limiting | Marcus |
| Public GitHub repo | Marcus |
| BetterAuth OAuth + email allowlist | Developer |
| Full CRUD via admin panel, no code changes | Developer |
| Contact form — bot protection transparent to humans | Sarah, Youssef |
| Mobile-responsive layout | Youssef |
| i18n infrastructure — French-ready content fields | Youssef, Developer |

## Innovation & Novel Patterns

### Detected Innovation Areas

**Progressive Disclosure UX**
The portfolio rewards exploration. The Overview page orients a cold visitor in under 5 seconds. Each layer deeper (Projects, Skills, Experience, Admin demo, GitHub repo) reveals something more technically substantial. No single page front-loads everything. The structure serves different reader intents simultaneously: a casual HR screen, a technical deep-dive, and a cold stranger finding the link second-hand each get what they need at the depth they go to.

**No Static Skills List**
The skills chart *is* the skills section. No logo grid, no tag cloud, no bullet list. If a skill isn't in the visualization, it isn't claimed. This constraint raises the quality bar on the chart itself and signals honesty over resume-padding.

**Work-First Structure**
The Overview page leads with work — projects, map, visualizations — not a bio or introduction. The developer is revealed through the work, not introduced upfront. Consistent with the core principle: capability felt through architecture, not stated in copy.

**Portfolio as Asynchronous Technical Screener**
The guest admin demo, public GitHub repository, and rate-limited API together function as a pre-interview instrument. A technical evaluator can probe the auth layer, inspect API responses, read the codebase structure, and assess architectural decisions before any human conversation happens. This is not a demo feature; it is a core product function.

### Implementation Notes

- **Repo as readable artifact:** Public GitHub repository structured for cold technical readers — clear README, logical directory layout, commit history that tells a coherent story
- **Mobile-first admin:** Admin panel fully functional on mobile — new projects added from a phone in under 90 seconds, no laptop required

### Validation Approach

- Progressive disclosure: technical visitors (Marcus persona) explore beyond the Overview without prompting
- No-skills-list: chart alone communicates tech depth clearly to non-technical visitors (Sarah persona)
- Async screener: technical interviewers arrive with specific, informed questions about implementation decisions

### Risk Mitigation

- No static skills list raises the chart quality bar — if the visualization is unclear, there's no fallback. Chart design is a launch-blocking quality gate, not a nice-to-have
- Progressive disclosure only works if each layer is genuinely worth the click. No placeholder or stub pages at launch

## Technical Platform Requirements

### Rendering & Architecture

Next.js App Router with hybrid rendering: SSR for all public-facing pages (SEO, performance, cold visitor experience); client-side navigation within the dashboard shell. The app shell loads once; page transitions are client-side. No real-time features in scope.

### Browser Support

Modern browsers only — last 2 major versions of Chrome, Firefox, Safari, and Edge. No legacy browser support. Permits unrestricted use of modern CSS (container queries, CSS variables, cascade layers) and modern JS APIs without polyfills.

### Responsive Design

Desktop-first layout — the SaaS dashboard sidebar structure is designed for wide viewports. Fully functional on mobile: sidebar collapses to a mobile nav, all pages usable on small screens, admin panel operable on a phone. Touch targets meet minimum size requirements.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the portfolio has no credibility value in a partial state. A hiring manager encountering an incomplete portfolio draws the opposite conclusion. All MVP features are launch-blocking; there is no staged public rollout.

**Resource:** Solo developer, ~56 hours total (2 hours/day weekdays + Saturday evening, approximately 1 month).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Sarah (hiring manager) — full public portfolio experience, Overview through Contact
- Marcus (technical lead) — guest admin demo + public GitHub repo probing
- Developer (owner) — OAuth login, full CRUD via admin panel, mobile-functional
- Youssef (freelance client) — mobile-responsive contact form, bot-protected

**Must-Have Capabilities:**
- Next.js App Router, sidebar navigation (Overview, Projects, Skills, Experience, Contact)
- Hand-drawn aesthetic Level 2 (Rough.js borders/SVG, sketchy chart rendering, styled Mapbox pins)
- Work-first Overview page — projects and map lead, person revealed through work; legible to non-technical visitors within 5 seconds
- Dark mode — CSS variables, system default + manual toggle (persisted)
- Mapbox GL JS — anonymized project/client pins with sector/region labels
- Data visualizations — tech stack depth, experience by domain, project volume over time; chart *is* the skills section (no static skills list)
- Progressive disclosure UX — each page layer complete and worth the click at launch; no stub pages
- BetterAuth + OAuth (Google or GitHub) — server-side email allowlist, admin access restricted to single configured email
- Admin panel — full CRUD for projects, skills, timeline/experience entries; mobile-functional
- Guest/read-only admin demo — server-enforced write blocking, rate limiting, sandboxed session, no sensitive data exposure; seamless entry (no login required)
- Contact form — forced engagement (no CV download), honeypot + rate limiting + Cloudflare Turnstile, accessible fallback
- i18n infrastructure (next-intl) — all strings externalized, English content, translatable admin content fields, French-ready
- Responsive design — desktop-first, fully functional on mobile
- WCAG 2.1 AA — keyboard nav, screen reader compatible, contrast verified in both modes
- SEO + Open Graph metadata on all public pages; admin routes excluded from indexing
- Public GitHub repository — structured as readable artifact (clear README, logical layout)

### Post-MVP Features

**Phase 2 — Growth:**
- French content translations (infrastructure in place — content work only)
- Interactive chart-to-project filtering (skills chart as navigation layer)
- Expanded project case studies with deeper write-ups
- Freelance-oriented contact flow improvements
- Analytics integration

**Phase 3 — Expansion (directional, not committed):**
- Additional language translations (Japanese and beyond)
- Open-source template/starter for other full-stack developers to fork
- Freelance optimization layer: testimonials, pricing, inquiry funnel

### Risk Mitigation Strategy

**Technical Risks:**
- *Guest admin sandboxing* — highest implementation risk; server-side enforcement, rate limiting, and session isolation must work in concert. Mitigation: build and security-test this first, before any public-facing polish work
- *Rough.js aesthetic quality* — sketchy rendering must look intentional, not broken. Mitigation: prototype on one page; lock the base style before applying across all pages
- *i18n overhead* — adds friction to every component. Mitigation: establish next-intl patterns on the first component built; use as template for all subsequent work

**Resource Risks:**
- *56-hour budget is tight for full MVP.* Single available cut: defer interactive chart-to-project filtering (Phase 2) — the chart works as a visualization, just not as a navigation layer
- No other MVP features can be cut without compromising the portfolio's core credibility signal

## Functional Requirements

### Public Portfolio Experience

- **FR1:** Visitors can view an Overview page that communicates the developer's identity, role, and primary call to action without technical background, within a single viewport
- **FR2:** Visitors can discover the developer's work and projects as the primary content on the Overview page, with personal introduction secondary
- **FR3:** Visitors can view a dedicated Projects page with project details and geographic context
- **FR4:** Visitors can view the developer's work history and professional timeline on an Experience page
- **FR5:** Visitors can contact the developer through a dedicated Contact page
- **FR6:** Visitors can explore the admin panel as a read-only guest without authenticating, accessible from the main navigation

### Navigation & Display

- **FR7:** Visitors can navigate between all portfolio sections via a persistent sidebar navigation
- **FR8:** Visitors can use all portfolio pages on a mobile device with full functionality (not read-only)
- **FR9:** Visitors can switch between light and dark display modes manually
- **FR10:** The system preserves a visitor's display mode preference across sessions

### Data Visualization & Mapping

- **FR11:** Visitors can view project and client locations on an interactive map with geographic pins
- **FR12:** Visitors can view anonymized location pins for confidential clients, showing sector and region without identifying information
- **FR13:** Visitors can discover the developer's skills exclusively through data visualizations — no static skills list exists
- **FR14:** Visitors can view tech stack depth, experience by domain, and project volume over time as distinct chart visualizations
- **FR15:** Visitors with assistive technology can access the information conveyed by map pins and charts through accessible text alternatives

### Content Management

- **FR16:** The administrator can create, update, and delete project entries via the admin panel
- **FR17:** The administrator can create, update, and delete skill entries via the admin panel
- **FR18:** The administrator can create, update, and delete timeline and experience entries via the admin panel
- **FR19:** The administrator can perform all content management operations from a mobile device
- **FR20:** The administrator can add translated content fields per entry to support multiple languages
- **FR21:** The public portfolio reflects content changes immediately after the administrator saves them, without a code deployment

### Authentication & Access Control

- **FR22:** The administrator can authenticate using an OAuth provider without a username or password
- **FR23:** The system restricts admin write access to a single pre-configured email address, enforced server-side
- **FR24:** Visitors can enter the guest admin demo without authenticating
- **FR25:** The system blocks all write operations from guest sessions at the server level, independent of UI state
- **FR26:** The system rate-limits requests to all API endpoints
- **FR27:** The system prevents guest sessions from escalating to authenticated admin access under any condition

### Contact & Anti-Spam

- **FR28:** Visitors can send a message to the developer through a contact form without downloading any file
- **FR29:** The system delivers contact form submissions to the developer's email inbox
- **FR30:** The system detects and silently blocks automated bot submissions before delivery
- **FR31:** The system presents no visible challenge or friction to legitimate human users when bot protection is active

### Internationalization

- **FR32:** The system renders all user-facing text through an internationalization layer with no hardcoded strings
- **FR33:** The administrator can manage translated content for all portfolio entries without modifying code
- **FR34:** The system serves the correct language content based on the active locale

### Discoverability & Transparency

- **FR35:** Search engines can crawl and index all public portfolio pages
- **FR36:** Social platforms can render rich preview cards when any public portfolio URL is shared
- **FR37:** The system excludes admin panel routes from search engine indexing
- **FR38:** Visitors can access the portfolio's public source code repository from within the portfolio

## Non-Functional Requirements

### Performance

- All public pages achieve Lighthouse scores ≥ 90 across Performance, Accessibility, Best Practices, and SEO at launch — measured on a standard desktop connection
- Core Web Vitals within Google's "Good" thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Time to Interactive on the Overview page ≤ 3 seconds on a 4G mobile connection
- Mapbox GL JS and Rough.js loaded only on pages that require them — not bundled globally
- Chart libraries render client-side with skeleton loading states to prevent cumulative layout shift

### Security

- All data transmission encrypted via HTTPS/TLS; no mixed-content on any page
- Admin write operations validated server-side on every request; client-side UI state is never the sole enforcement mechanism
- Guest session tokens are cryptographically distinct from admin session tokens and carry no write permissions at the server level — escalation is architecturally impossible, not just UI-blocked
- Rate limiting applied to all API endpoints; contact and admin-write endpoints apply stricter limits
- OAuth tokens never exposed to the client; authentication state managed server-side via secure, `httpOnly` cookies
- No sensitive data (developer email, admin session info, internal IDs) exposed in guest mode API responses
- Contact form submissions validated server-side before delivery; honeypot and Turnstile checks enforced at the API layer, not only the UI layer

### Accessibility

- WCAG 2.1 Level AA compliance across all public-facing pages
- All interactive elements keyboard-navigable with visible, consistently styled focus indicators
- Colour contrast ratios meet AA standards in both light and dark modes — verified independently for each palette, not assumed
- Decorative Rough.js SVG elements marked `aria-hidden="true"`; no accessibility tree pollution from visual styling
- Map pins and chart data accessible via text alternatives (tooltip text, list view, or equivalent) for screen reader users
- `lang` attribute on `<html>` reflects the active locale at all times
- Dark mode CSS variables maintain AA contrast ratios independently — light and dark palettes both validated
- All translated strings carry through to `aria-label` attributes where relevant

### Integration

- **Mapbox GL JS:** Map renders and pins load within 3 seconds on a standard connection; graceful fallback displayed if Mapbox fails to initialise
- **BetterAuth + OAuth:** Authentication flow completes with Google or GitHub; error state surfaced clearly if provider is temporarily unavailable
- **Cloudflare Turnstile:** Contact form remains submittable if Turnstile fails to load — graceful degradation, no silent blocking of legitimate users
- **Email delivery:** Contact form submissions reach the developer's inbox reliably; failed deliveries surface an error to the user rather than silently dropping
- **next-intl:** Missing translation keys fall back to English without throwing an error or rendering a blank string

### Reliability

- Portfolio available 99.9% uptime monthly — a hiring manager following up on an application must never encounter a down page
- Failed admin content saves surface an explicit error to the administrator; no silent data loss on write operations
