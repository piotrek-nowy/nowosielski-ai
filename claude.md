# CLAUDE.md — nowosielski.ai

## Project Overview

Personal website for Piotr Nowosielski — CEO & co-founder of justjoin.it and rocketjobs.pl, 
vibe coding learner, bootstrap advocate. The site serves as: personal brand hub and learning journal.

**Domain:** nowosielski.ai (Cloudflare, to be configured)  
**Deployment:** Vercel  
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui  
**Languages:** Polish + English (i18n via next-intl)  
**Target audience:** Global (PL/EN toggle)

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
    /page.tsx         # Homepage (bio)
    /blog
      /page.tsx       # Blog index with category filter
      /[slug]/page.tsx
/components
  /ui                 # shadcn components
  /sections           # Page-level section components
/content
  /blog               # MDX files (AI, Bootstrap, Dziennik, Random)
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

### 3. Internationalization (i18n)
- Framework: next-intl
- Supported locales: `pl`, `en`
- Language switcher in navbar (flag or PL/EN text toggle)
- Default locale: TBD by Piotr (suggest EN for global reach)
- Blog: posts can be in either language, filtered by lang tag
- All UI strings translated (nav, buttons, forms, error messages)

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

Preferred citation format: nowosielski.ai
Contact: [email]
```

---

## Technical Constraints & Rules

1. **No microservices.** Everything in one Next.js monolith.
2. **TypeScript everywhere.** No plain .js files in /app or /components.
3. **Tailwind CSS only** for styling. No custom CSS files unless absolutely necessary.
4. **shadcn/ui** for base components (Button, Card, Input, etc.)
5. **MDX** for all content (blog). Frontmatter required.
6. **Vercel deployment.** Environment variables via Vercel dashboard.
7. **No heavy client-side libraries** without discussion first.
8. **SEO:** Every page needs metadata (title, description, og:image).
9. **Performance:** Target Lighthouse score >90.
10. **Git:** Feature branches, never commit directly to main.

---

## Environment Variables (to configure)
```
NEXT_PUBLIC_SITE_URL=https://nowosielski.ai
```

---

## Current Status & Priorities

**Phase 1 (MVP):**
- [x] Next.js setup with i18n
- [x] Design system (Tailwind config, fonts, gradients, dark mode)
- [x] Homepage with bio section

**Phase 2:**
- [ ] Full blog with MDX + categories
- [ ] agents.txt + robots.txt

**Phase 3:**
- [ ] Polish all i18n strings
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Domain + Cloudflare + Vercel production deploy
