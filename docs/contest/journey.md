# Build journey — Prépa TEF TCF (contest)

> Product-milestone log. Condensed 2026-10-28 from a chat-level log to a
> milestone log per owner request: all pre-Stage 0 preparation was merged into
> the single baseline entry below. No product history was removed — no product
> code existed yet; full decision text lives in
> `docs/contest/scope-decisions-2026-10-28.md`. Future changes stay
> append-only: never edit a past entry, add a new dated entry that supersedes.
> Privacy: no API keys, no real names, no private chat content in this file.
> This file is for the builder/owner only — never surface it in the learner UI.

## Conventions

- One entry per real product change only: scaffold done, scorer trial,
  partner test, mock run, real-user test, bugfix, submission. Chat-level
  steps are not entries.
- Each entry has: Milestone / Product change / Verification / Redirect.
  Redirect names the decision that changed direction as a file link, without
  copying its content at length.
- English only in this file. File names, commands and code terms stay English.

---

## 2026-10-28 — Baseline: scope locked, no code yet

- Milestone: pre-Stage 0 preparation complete; product work not started.
- Product change: none — no app code written. Repo holds the locked scope
  (TEF Canada only; Writing B + Speaking B with AI scoring; shortened 4-skill
  mock; guest, free, on-device history; English UI with French exam content;
  "Prépa" display name; plum/gold tiles with skill colours as accent only;
  "AI partner" hero with the mandated "Examinateur IA (demo)" label), the
  final design reference (`design/prepa-contest-final/`, 11 screens), and an
  approved-pending Stage 0 scaffold plan. Prep commits on
  `init/prepa-tef-tcf`: `init: add contest docs, final design and gitignore`
  (40 files) and `docs: contest scope decisions and references` (5 files);
  nothing pushed. Session rules in force: chat in Vietnamese, repo files
  English-only, French only in exam content.
- Verification: `git log` shows the 2 commits on `init/prepa-tef-tcf`;
  `apps/` does not exist yet; Stage 0 plan presented, awaiting `go`.
- Redirect: `docs/contest/scope-decisions-2026-10-28.md` (decisions 1-10 —
  the single source of truth; wins over older docs).

## 2026-10-28 — Log condensed from chat log to milestone log

- Milestone: journey format change (meta entry, no product change).
- Product change: none. The 10 chat-level entries written earlier today
  (session rules, branch creation, init commit, doc summaries, scope
  restatements, decision-10 detail, docs commit, plan handoff, log maintenance)
  were merged into the single baseline entry above. Nothing
  product-relevant was dropped: no code existed, and every ruling stays in
  full in `docs/contest/scope-decisions-2026-10-28.md`.
- Verification: full readback after rewrite; all-English scan clean (only
  non-ASCII left is `é` in the mandated display name "Prépa"); dates and
  order preserved.
- Redirect: owner request 2026-10-28 — milestone log only from now on.

## 2026-10-28 — Stage 0 scaffold runs

- Milestone: Stage 0 scaffold complete on branch `stage-0-scaffold`; no AI wired yet.
- Product change: new `apps/mobile` Expo app (TypeScript, expo-router): onboarding (Welcome / Start practising), 3-tab nav (Home · Mock Test · History), Home with 4 skill tiles (Speaking plum, Writing gold, skill colours as accent dots only), shortened 4-skill mock flow (Listening/Reading 2 demo questions each with full-version note; Writing B with 200-word floor warning; Speaking B with editable transcript, "Examinateur IA (démo)" label and demo disclaimer), result screen showing NCLC range + "Estimation" (never an exact score), on-device History, always-open Detailed Analysis. English UI, French exam content, "Prépa" display name, "AI partner" hero copy. Template demo files deleted; no login, TPC, Pro, leaderboard, streak, or TCF data anywhere.
- Verification: `tsc --noEmit` clean; banned-token sweep (tpc/isPro/TCF_TASKS//699/AI examiner) empty; `expo export --platform web` compiled all 15 route bundles with no errors (live Metro smoke test was blocked by a port clash with another local project and sandbox localhost limits — server itself starts clean).
- Redirect: `docs/contest/scope-decisions-2026-10-28.md` (decisions 2, 5, 8, 9, 10).

## 2026-10-28 — Onboarding restyled to design; Animation screen added

- Milestone: onboarding now follows `design/prepa-contest-final/screens/Onboarding.dc.html`; new Animation screen between Splash and Entry.
- Product change: flow is Splash (1800ms/tap) → Animation (~2.3s, tap skips) → Entry (renamed from welcome route) → Home. Real vector logos rendered to PNG (logo 236px, mark 120px); mist gradient + feathered gold/plum blobs; Entry keeps design copy, plum pill button and "Examinateur IA (demo)" label. Animation uses only built-in Animated: logo bounce 0.7→1, gold dot pop, 2 expanding rings, 5 twinkling stars, gentle float, then auto-advance with tap guard.
- Verification: `tsc --noEmit` clean; web export compiled splash/animation/entry/home/mock/history/test/result/analysis with no errors. Device rendering (shadow lift, blob richness) confirmed only by owner screenshots, not by builder.
- Redirect: owner direction 2026-10-28 (design file is visual authority; per-screen approval).

## 2026-10-29 — Bottom nav matched to design; sliding pill deferred

- Milestone: floating pill tab bar now matches `design/prepa-contest-final` on iOS and Android; tab content fade + pill crossfade added; animation screen temporarily bypassed (splash goes straight to entry).
- Product change: `(tabs)/_layout.tsx` rewritten with custom tabBarButton (full-width items, white pill wraps icon + label, `aria-selected` focus, marginHorizontal side gaps, longhand paddings to beat the navigator's base styles); new `components/TabScreenFade.tsx` wraps the three tab screens (220ms fade + rise); splash points to `/entry` (TEMP, one-line revert in `splash.tsx`).
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes; device rendering confirmed only by owner screenshots.
- Deferred (revisit if tokens remain after the app is done): sliding pill indicator that travels between tabs (needs measured tab positions); the current crossfade is the approved interim.
- Redirect: owner direction 2026-10-29 (commit design-matching parts only; self-made additions stay uncommitted; no push yet).

## 2026-10-29 — Home, Mock catalogue + session detail follow design

- Milestone: Home brought to design (Up next header, 82% snap rail, rich result-summary card, NCLC + CEFR values, Inter everywhere, safe-area top); Mock tab rebuilt as the design catalogue (app bar, exam context row, working Newest/Oldest sort, year rails of month cards); new `mock/[id]` session detail (dark hero, readiness panel, skill cards, exam-structure card, sticky CTA); skill order fixed to Listening, Reading, Speaking, Writing.
- Product change: `(tabs)/index.tsx`, `(tabs)/mock.tsx`, `mock/[id].tsx`, `content/mocks.ts`, `constants/theme.ts` (SKILL_DARK, SKILL_DEEP, SKILL_ORDER), `app/_layout.tsx` (route registration), `(tabs)/history.tsx` (fade + bottom clearance for the floating bar), `components/TabScreenFade.tsx`.
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes including `mock/[id]`; device rendering confirmed only by owner screenshots.
- Deferred (revisit after the app is done): watermark numeral fidelity on the detail hero (explicit right anchor now; month-number based, no database needed).
- Redirect: owner direction 2026-10-29 — splash TEMP bypass, package files, `test/[skill]`, scope doc stay uncommitted; no push. Next: UI of the 4 skills per design.
