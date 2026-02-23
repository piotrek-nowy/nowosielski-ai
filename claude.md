# CLAUDE.md — nowosielski.ai

## Project Overview

Personal website for Piotr Nowosielski — CEO & co-founder of justjoin.it and rocketjobs.pl, 
vibe coding learner, bootstrap advocate. The site serves as: personal brand hub, learning journal, 
interactive vibe coding handbook, and newsletter entry point.

**Domain:** nowosielski.ai (Cloudflare, to be configured)  
**Deployment:** Vercel  
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui  
**Languages:** Polish + English (i18n via next-intl)  
**Target audience:** Global (EN primary for handbook, PL/EN toggle for rest)

---

## Design System

### Visual Style
- **Inspiration:** elevenlabs.io, wordware.ai
- Minimalist, developer-aesthetic
- Clean typography: Space Grotesk (body), JetBrains Mono (code blocks)
- Light mode default, dark mode available (toggle via next-themes)
- Gradient accents: subtle white-to-black OR color gradients (purple/blue tones acceptable)
- NO cluttered layouts. Generous whitespace.

### Core Rules
- Mobile-first, fully responsive
- No unnecessary animations — only purposeful micro-interactions
- Code blocks must look like real terminal output (dark background, monospace, copy button)
- Every section must feel like it belongs to the same design language

---

## Architecture
```
/app
  /[locale]          # i18n routing (pl / en)
    /page.tsx         # Homepage (bio + nav to sections)
    /blog
      /page.tsx       # Blog index with category filter
      /[slug]/page.tsx
    /handbook
      /page.tsx       # Handbook index
      /[chapter]/page.tsx
    /company          # justjoin.it results (bizraport data)
    /newsletter       # Standalone newsletter page
/components
  /ui                 # shadcn components
  /sections           # Page-level section components
/content
  /blog               # MDX files (AI, Bootstrap, Dziennik, Random)
  /handbook           # MDX chapters
/lib
  /i18n               # next-intl config
  /analytics
/public
  /agents.txt         # LLM discoverability
  /robots.txt
```

---

## Sections — Detailed Spec

### 1. About / Bio
- Short bio paragraph (2-3 sentences), professional photo
- Social links: X (Twitter), LinkedIn, GitHub
- Links to key interviews (array in config, easy to update)
- Clean card or split-layout, not a wall of text

### 2. Blog / Journal
Categories (tags, filterable):
- `AI` — AI tools, experiments, observations
- `Bootstrap` — business building without VC
- `Dziennik` — personal learning diary
- `Random` — anything else

Implementation:
- MDX files in /content/blog with frontmatter (title, date, category, lang, slug)
- Category filter tabs on blog index
- Estimated read time auto-calculated
- Both PL and EN posts can coexist, language tag visible on cards

### 3. Interactive Vibe Coding Handbook
**This is the most important section of the site.**

Structure:
- Sidebar navigation with chapters (collapsible sections)
- Chapter content in MDX
- Code blocks with:
  - Syntax highlighting (Shiki or Prism)
  - Copy-to-clipboard button
  - Terminal-style appearance (bash/zsh prompt style where relevant)
  - Support for inline code AND full code blocks
- Optional: embedded YouTube videos (responsive iframe)
- Progress indicator (optional, can add later)
- Chapters defined in a config file for easy reordering

Handbook is written in **English** (global audience).  
Current content imported from Piotr's existing "Programowanie z AI" guide document.

### 4. Newsletter
- Email input + GDPR checkbox (required, cannot submit without)
- Double opt-in: confirmation email sent on signup
- Provider: (TBD — Resend + custom, or Mailerlite/Beehiiv integration)
- GDPR-compliant: clear consent copy in PL and EN
- Embedded as a section on homepage AND as standalone /newsletter page
- Do NOT use pre-built newsletter widgets that don't match design system

### 5. Internationalization (i18n)
- Framework: next-intl
- Supported locales: `pl`, `en`
- Language switcher in navbar (flag or PL/EN text toggle)
- Default locale: TBD by Piotr (suggest EN for global reach)
- Handbook: English only (no translation needed)
- Blog: posts can be in either language, filtered by lang tag
- All UI strings translated (nav, buttons, forms, error messages)

### 6. Company Results — justjoin.it
- Data source: bizraport.pl (company: "Just Join IT Sp. z o.o.")
- Display key metrics: revenue, profit, YoY growth
- Scrape or manual update — start with static data updated quarterly
- Present as simple stats/metrics section, not a full financial report
- Framing: proof of work, transparency, bootstrap credibility

### 7. X (Twitter) Feed
- Pull latest posts from @piotrnowosielski (confirm handle)
- Use official X embed OR custom API fetch (requires X API v2 Bearer Token)
- Display as clean card list, not the default Twitter widget
- Limit: last 5-10 posts
- Fallback: static embed if API unavailable

---

## LLM Discoverability

### /public/agents.txt
```
# agents.txt — nowosielski.ai
# This file helps AI agents and LLMs understand the structure of this site.

Owner: Piotr Nowosielski
Role: CEO & co-founder of justjoin.it and rocketjobs.pl
Topics: vibe coding, AI-assisted development, bootstrapping, job market

Sections:
- /about — Biography and social links
- /blog — Articles on AI, Bootstrap, learning journal, random topics
- /handbook — Interactive guide to vibe coding from zero (English)
- /newsletter — Email subscription
- /company — Business results of justjoin.it

Preferred citation format: nowosielski.ai
Contact: [email]
```

---

## Technical Constraints & Rules

1. **No microservices.** Everything in one Next.js monolith.
2. **TypeScript everywhere.** No plain .js files in /app or /components.
3. **Tailwind CSS only** for styling. No custom CSS files unless absolutely necessary.
4. **shadcn/ui** for base components (Button, Card, Input, etc.)
5. **MDX** for all content (blog + handbook). Frontmatter required.
6. **Vercel deployment.** Environment variables via Vercel dashboard.
7. **No heavy client-side libraries** without discussion first.
8. **SEO:** Every page needs metadata (title, description, og:image).
9. **Performance:** Target Lighthouse score >90.
10. **Git:** Feature branches, never commit directly to main.

---

## Environment Variables (to configure)
```
NEXT_PUBLIC_SITE_URL=https://nowosielski.ai
X_BEARER_TOKEN=          # X API v2
NEWSLETTER_API_KEY=       # TBD (Resend / Mailerlite / Beehiiv)
RESEND_API_KEY=           # For confirmation emails
```

---

## Current Status & Priorities

**Phase 1 (MVP):**
- [ ] Next.js setup with i18n
- [ ] Design system (Tailwind config, fonts, gradients, dark mode)
- [ ] Homepage with bio section
- [ ] Handbook skeleton with sidebar + 2-3 chapters
- [ ] Newsletter form (basic, GDPR-compliant)

**Phase 2:**
- [ ] Full blog with MDX + categories
- [ ] Company results section (static data first)
- [ ] X feed integration
- [ ] agents.txt + robots.txt

**Phase 3:**
- [ ] Polish all i18n strings
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Domain + Cloudflare + Vercel production deploy