# AI Learnium Redesign — Complete UI/UX Specification

## 1. Product Overview

Design a modern, premium expansion of **Learnium** — an AI-powered exam preparation and practice platform for Indian school students (Class 11, 12 & CUET).

The product allows users to:

* Browse exams, subjects, and chapters
* Solve interactive PYQs and MCQs with instant feedback
* Get AI-powered performance analysis
* Track streak, accuracy, and mastery over time
* Auto-collect mistakes into a smart Mistake Notebook
* Identify weak topics and skill gaps
* Receive a personalized AI study plan
* Practice with flashcards and revision sessions
* Chat with an AI Tutor for doubt-solving
* Take timed mock tests

The interface should feel like a **real edtech product used by lakhs of aspirants**, not a student project.

---

## 0. Frozen Scope — DO NOT TOUCH (hard constraint)

The following are **locked and must not be redesigned, restyled, or rethemed in any way**:

* The **entire landing page** (`Landing.jsx`) — copy, layout, sections, CTAs stay exactly as-is
* The **violet theme**: `canvas-dark #1f1633`, `night/primary #150f23`, `lime #c2ef4e`, `pink #fa7faa`, `violet #6a5fc1`, `violet-deep #422082`, `violet-mid #79628c`, hairlines (`#362d59`, `#cfcfdb`, `#e5e7eb`), `ink #1f1633`
* The **typography**: Display `Space Grotesk`, UI `Rubik`, Code `Ubuntu Mono` — including the full type scale (hero 88 → micro-cap 10)
* The **dual-theme split**: dark starfield marketing/auth surfaces (`lm-starfield`, `lm-glow`, no drop shadows on dark) vs clean white app interiors
* The **feedback semantics**: lime = correct/success, pink = wrong/critical, yellow = reviewing, violet = interactive/brand
* The **auth cards** (dark starfield + white `rounded-xxl` card pattern)

Every new screen below MUST be built exclusively from these existing `@theme` tokens. No new brand colors, no new fonts, no landing edits. New work should look like it was always part of the same product.

---

## 2. Design Philosophy

The UI should communicate:

**Learning + Focus + Progress + Trust**

Visual direction:

* Modern edtech SaaS
* Minimal
* Studious but friendly
* Clean typography (Space Grotesk display, Rubik body, Ubuntu Mono for options/data)
* Dark violet marketing moments, calm white study surfaces
* Rounded cards (`rounded-xl` / `rounded-xxl`)
* Excellent spacing
* Smooth, fast animations
* Strong visual hierarchy
* Data-driven dashboards
* Mobile responsive

Avoid:

* New accent colors outside the frozen palette
* Cartoon mascots or childish illustrations
* Cluttered dashboards
* Huge text everywhere
* Generic AI robot imagery
* Overly flashy animations
* Restyling anything listed in Section 0

The design should be comparable in polish to modern products such as Linear, Notion, Duolingo (minus the playfulness), Stripe, and modern AI learning dashboards — but always in Learnium's violet voice.

---

## 3. Color System (frozen — use only these)

Primary surfaces:

* Dark canvas `#1f1633` / night `#150f23` for marketing, auth, and premium moments
* White / off-white app interiors with `hairline-cloud #e5e7eb` borders

Semantic system (already established — extend, don't replace):

* Mastery / Correct → Lime `#c2ef4e` (backgrounds: `lime/10`)
* Brand / Interactive → Violet `#6a5fc1` (deep `#422082` for premium teasers, mid `#79628c` accents)
* Wrong / Critical → Pink `#fa7faa` (backgrounds: `pink/10`)
* Reviewing / Needs work → Yellow/amber
* Secondary info → Ink at reduced opacity (`ink/60`, `ink/40`), `on-dark-muted` on dark

Use colors to communicate learning state, not decoration.

---

## 4. Typography (frozen — use only these)

* Display: `Space Grotesk` — headings, logo, big numbers, question text
* UI: `Rubik` — body, labels
* Code: `Ubuntu Mono` — options (A./B./C./D.), indices, years, data

Hierarchy (existing scale):

* H1: 30–60px (`heading-xl` → `display-lg`)
* H2: 24–27px (`heading-md`/`heading-lg`)
* H3: 20px (`heading-sm`)
* Body: 16px (`body-md`/`body-lg`)
* Metadata: 14px caption, 10px uppercase micro-cap eyebrows

Use weight and spacing, not new colors, for hierarchy.

---

## 5. Landing Page — FROZEN

Do not redesign the landing page. It stays exactly as it is: sticky auth-aware nav, starfield hero (`Study smarter, not longer` + lime chip), 6 feature cards, Traditional-vs-Learnium compare section, final CTA, footer.

New work may only **link into** it (logo → `/`, footers, auth redirects). Nothing else.

---

## 6. Authentication (extend, don't restyle)

Keep the existing dark-starfield + white card pattern and the GIS Google button with redirect fallback.

Add without changing visuals:

* Forgot password flow (matching card style)
* Clear `?error=google` messaging inside the existing red error box
* Preserve `returnTo` after login (already wired — keep the behavior on all new protected pages)

---

## 7. Exam / Subject / Chapter Browse (polish, don't restyle)

Keep the existing white-card browsing flow. Elevate it:

Header pattern per level:

**Which exam are you preparing for?** → **Choose a subject** → **Choose a chapter**

Add to each level without breaking the look:

* Search bar (filter exams/subjects/chapters by name)
* Per-card progress ring (attempted / mastered %) in violet/lime
* "Continue where you left off" card at top (resume last chapter)
* Chapter rows: keep mono index + name + `→`; add attempt count, accuracy dot, and difficulty mix
* Empty states: keep the tone, add a CTA back to `/exams`

Anonymous browsing must keep working (backend `optionalAuth`).

---

## 8. Solve Experience Loading & Transitions

Do not show a bare spinner between questions.

Show:

**Loading questions...** with skeleton question card (shimmering option rows in the existing card shape).

Between chapters show a brief transition:

✓ Chapter loaded
→ Calibrating difficulty
○ Fetching your history

Keep it in the white-card visual language.

---

## 9. Main App Shell (new)

Introduce a persistent study shell for all protected pages:

Left sidebar navigation:

### Study

* Dashboard
* Practice (exam browser)
* Mock Tests
* Flashcards

### My Learning

* Mistake Notebook
* Revision Planner
* Study Plan

### Tools

* AI Tutor
* Topic Analyzer
* PYQ Explorer

### Account

* Profile
* Settings

Top bar: streak flame (violet), day streak count, accuracy pill, avatar → profile/logout.

Mobile: collapsible sidebar → bottom tab bar (Practice, Mock, Mistakes, Tutor, More). Tablet: icon-rail sidebar. Do not just shrink desktop.

---

## 10. Dashboard Header

Top:

**Good evening, Mohit 👋**

Subtext:

**You're on a 6-day streak. Physics needs attention today.**

Right side:

**Practice Now** (violet solid) + **Take a Mock** (outline)

---

## 11. Learning Health Score (new hero card)

Create a large visual score card reusing the Dashboard pattern:

### Learning Score

**78 / 100**

Visual: large circular progress indicator (violet ring, lime segment for mastered).

Below:

**Strong — you're exam-ready in 4 of 7 chapters. Mechanics is holding you back.**

Break score into:

Accuracy — 84
Consistency (streak) — 72
Syllabus Coverage — 68
Revision Health — 61
Speed — 80

Each row: label + thin progress bar + number, using only violet/lime/pink/gray.

---

## 12. Dashboard Analytics

Upgrade the 3 existing `StatCard`s (Streak / Solved / Accuracy) into a richer grid. Keep their look; add:

### Questions Solved

1,240

### Day Streak

6 🔥

### Accuracy

84%

### Revision Due

18

Each card: icon, number (Space Grotesk), small description, trend line:

`+12 solved this week`

Add a 7-day activity heat-strip (violet intensity = attempts) under the cards.

---

## 13. Performance Analysis Page (new)

Top:

**Performance Analysis**

Tabs:

* Overview
* Accuracy
* Speed
* Topics
* History

Overview tab: Learning Score card + analytics grid + heat-strip + "weakest 3 topics" list with **Practice** buttons.

---

## 14. Topic Mastery Analysis

Large header:

**Mechanics: 58% mastery — needs work**

Horizontal breakdown per topic:

Laws of Motion
████████░░░░ 68%

Work Energy Power
██████░░░░░░ 52%

Rotational Motion
████░░░░░░░░ 41%

Then:

### What to fix

⚠ Rotational Motion — accuracy below 50% across 34 attempts
⚠ Slow on numericals — avg 3.2 min vs 1.8 min target
✓ Laws of Motion — exam-ready, move to revision

Each issue card: **Practice Topic →** button deep-linking to the solve flow.

---

## 15. Mistake Notebook 2.0 (upgrade existing)

Keep the existing status pills (All / Unreviewed / Reviewing / Learned) and card language. Add:

* Group by chapter toggle + search mistakes by text
* Spaced-repetition queue: **"12 due for revision today"** shelf on top
* Per-card: keep retry + explanation + notes-on-blur; add **Re-attempt for real** (submits a fresh attempt to the backend) vs **Quick retry** (client-side only, as today)
* One-tap **Mark Learned** swipe/hover action
* Empty state when a filter has nothing: illustration-free, with CTA to practice the chapter

---

## 16. AI Suggestions (new)

Header:

**Improve your prep**

Each recommendation:

* Problem
* Why it matters
* AI-generated action
* CTA button

Example:

### Shaky Formulas in Rotation

You got 5/9 formula-recall questions wrong in Rotational Motion.

AI plan:

> Revise the 8 core formulas, then solve 15 targeted questions. Estimated time: 40 min.

Buttons: **Start Plan** / **Dismiss**

---

## 17. Mock Test Experience (new — major feature)

Header:

**Mock Tests**

Subtext:

**Exam-pattern tests with negative marking and a timer.**

Test list cards:

### Class 12 Physics — Full Syllabus Mock 3

45 questions · 90 min · +4 / −1

**Best: 128/180** · Attempts: 2

Button: **Start Test**

Live test UI: keep `QuestionCard` language; add timer bar (violet → pink under 10 min), question palette grid (unanswered gray / answered violet / marked pink), **Mark for review**, auto-submit on timeout.

---

## 18. Mock Result Explanation (new)

### You scored 128/180 — 71st percentile (estimated)

✓ Mechanics — strong
✓ Optics — strong
⚠ Electrostatics — 9 marks lost to sign errors
⚠ Time pressure — 6 questions unattempted

Then:

### What to improve

Revise: Electrostatics sign conventions
Practice: 20 timed numericals

Estimated improvement: **128 → 145**

Buttons: **Review Mistakes** (pushes wrong ones to notebook) / **Retake**

---

## 19. PYQ Explorer (new)

Header:

**Explore Previous Year Questions**

Filters: exam, subject, chapter, year (Ubuntu Mono chips), difficulty.

Results: question rows with year tag + difficulty dot + "solved ✓ / unsolved" state. Click → opens in solve flow.

---

## 20. Revision Planner (new)

Left: calendar strip (this week) with due counts per day.

Center: today's revision queue — mistake-notebook cards due via spaced repetition, each with **Revise** button.

Right: AI note:

**AI Suggestion**

"3 Rotational Motion mistakes are about to fade. 15 minutes now saves an hour later."

Button: **Start Revision Session**

---

## 21. Study Plan Board (new)

Kanban-style board. Columns:

### Today

### This Week

### Backlog

### Done

Cards are study tasks (`Revise Rotational formulas`, `Mock 4 — Sunday`, `Finish Wave Optics PYQs`). Drag between columns. Each card: estimate, topic tag, status. Completing a task animates the Learning Score.

---

## 22. AI Tutor Chat (new — the flagship)

Header:

**AI Tutor**

Powered by your mistake history and syllabus position.

Example prompts:

* Explain rotational dynamics simply
* Quiz me on Laws of Motion
* Why is my answer wrong here?
* Give me 5 hard electrostatics questions
* Make a 7-day plan for Physics
* Summarize this chapter's formulas

Chat UI: white surface, violet user bubbles, ink assistant bubbles with mono formula blocks, inline **Practice this →** and **Save to notes** actions on answers. Minimal, studious, fast.

---

## 23. Profile Page (new)

Show:

Profile info (name, email, avatar from Google)

Target exam:

**Class 12 + CUET**

Enrolled exams, subjects in progress with coverage bars

Experience level: **Class 11 / Class 12 / Dropper**

Resume of stats: streak, solved, accuracy, mocks taken

Preferences: daily goal, reminder time, exam date countdown

---

## 24. Settings (new)

Sections (same white-card language):

Account (name, exam focus)
Security (change password, Google link status, active sessions → revoke)
Notifications (daily reminder, revision nudges, mock alerts)
Privacy (anonymous practice default, public leaderboard opt-in)
Danger zone (reset progress, delete account — with confirm modal)

---

## 25. Responsive Design

Desktop: sidebar shell + content max-widths (`max-w-4xl` browse, `max-w-xl` solve, `max-w-5xl` admin).

Tablet: icon-rail sidebar, 2-col grids collapse to 1.

Mobile: bottom tab bar; solve flow full-width with sticky Submit; palette becomes bottom sheet; tables become cards.

All screens must work on desktop, laptop, tablet, mobile. Never just shrink desktop.

---

## 26. Animations

Subtle, fast, studious:

* Card hover (violet border fade — existing pattern)
* Score counter + circular ring animation
* Heat-strip fill-in
* Page transitions (fade/slide 150–200ms)
* Skeleton shimmer on loads
* Button micro-interactions (existing uppercase tracking style)
* Streak flame pulse on milestone
* Kanban drag ghost

No bouncy physics, no confetti, no mascot dances.

---

## 27. Components (extend the existing set)

Already exist — reuse, don't rebuild: `QuestionCard`, `FilterBar`, `FeedbackPanel`, `GoogleSignInButton`, `ProtectedRoute`, `RequireAdmin`, `StatCard`, `MistakeCard`.

Build new ones in the same theme:

* AppShell / Sidebar / Topbar / BottomTabs
* Button (primary violet-dark / secondary outline / danger pink)
* Card / ScoreRing / ProgressBar / HeatStrip
* TopicBadge / DifficultyDot / YearTag
* MockCard / PaletteGrid / TimerBar
* RevisionCard / PlanColumn / TaskCard
* TutorBubble / PromptChip
* Modal / Tabs / Dropdown / Toast
* SkeletonLoader / EmptyState / SearchBar

---

## 28. UX Principles

Every page answers:

1. Where am I in my prep?
2. What is my weakest link right now?
3. What single action improves me most?

Prefer actionable over informational:

Instead of: "Your accuracy is 72%."
Prefer: "Your accuracy is 72% — fix sign errors in Electrostatics to reach 80+."

Continuously guide toward practice → revision → mastery.

---

## 29. Overall User Flow

Landing Page (frozen)

↓

Sign Up / Login (GIS + redirect fallback)

↓

Pick Exam → Subject → Chapter

↓

Solve (instant feedback, timed)

↓

Dashboard (score, streak, analytics)

↓

Mistake Notebook (auto-collected, spaced revision)

↓

Topic Mastery (weak-link analysis)

↓

AI Suggestions → Study Plan

↓

Mock Tests (exam pattern)

↓

AI Tutor (doubts, quizzes, plans)

↓

Revision Planner (never forget)

---

## 30. Technical UI Requirements

Use:

* React 19 + react-router-dom 7 (existing)
* Tailwind CSS v4, tokens **only** from `src/index.css` `@theme` — no new colors, no new fonts
* Lucide React icons (new dependency — replaces today's `×/›/→` glyph affordances)
* Reusable components + data-driven rendering (no hardcoded repeated UI)
* Responsive layouts (sidebar shell / rail / bottom tabs)
* Accessible buttons and forms (keep `focus:ring-ring-focus` pattern)
* Loading states (skeleton, never bare spinners on key flows)
* Error states (keep the red-box language), empty states, toasts, skeleton loaders
* Auth: `AuthContext` + `ProtectedRoute` + `RequireAdmin` stay the gatekeepers; every new protected page sits behind them with `returnTo` preserved
* API: existing `axios` instance + `api/admin.js` pattern for any new domains (e.g. `api/mocks.js`, `api/tutor.js`); anonymous-safe pages keep `optionalAuth` behavior with `tracked:false` upsell

Do not hardcode repeated UI elements. Do not add a component library that fights the theme (no MUI/Chakra defaults leaking in). Do not touch `Landing.jsx`, `index.css` tokens, or auth card visuals.

---

## 31. Final Visual Goal

The final product should feel like a combination of:

**Duolingo's habit-loop + Linear's polish + a serious Indian exam-prep workspace**

but must remain unmistakably Learnium — dark violet marketing, lime wins, pink warnings, Space Grotesk numbers, mono options.

The user should immediately feel:

> "This is where toppers practice."

rather than:

> "This is a coaching PDF viewer."

Prioritize **study momentum, weak-link clarity, and revision that sticks** over decorative UI.
