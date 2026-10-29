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

## 2026-10-29 — Listening rebuilt as practice flow with TTS

- Milestone: Listening demo now follows the design practice flow (consignes gate, listen, pick, instant verdict with transcription, complete) with French TTS audio via `expo-speech`.
- Product change: `test/[skill].tsx` (listening stages only; reading/writing/speaking UI untouched), `content/exam.ts` (2 French transcripts, per-answer feedback, consigne rules). Practice rules: unlimited replay, no timer, no navigator grid (2 questions), no waveform (TTS exposes no progress). Audio stops on pick, exit, and unmount.
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes. No maintained test harness exists in the repo (scripts cover start/lint/tsc/export only), so no committed test was added; TTS and flow need owner device checks. Device rendering confirmed only by owner screenshots.

## 2026-10-29 — Listening corrected to mock flow (owner review)

- Context: the first rebuild used practice mechanics (tap-to-play, instant verdict). Owner pointed out the session is a mock test: no per-answer verdict, audio autoplays.
- Product change: `test/[skill].tsx` listening stages are now consignes (dark, mock rules, gold warning, sticky Commencer CTA) → question (TTS autoplay, options locked dashed until the document ends, pick locks and auto-advances after 1.5s) → complete. Real 5:00 countdown in chrome with auto-finish at zero; design exit-sheet copy with live progress rows. Reading/writing/speaking untouched. Deleted the practice feedback/transcription UI; transcripts stay as the TTS source only.
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes; no committed test (no harness); device checks by owner.

## 2026-10-29 — Listening strict 5-phase mock (owner review)

- Context: owner required the exact design beat order for every question (signal, consigne pre-read, document, spoken question, 10s pause), autoplay everywhere, and an airport transcript for Illustrations.
- Product change: `test/[skill].tsx` listening phase machine signal → consigne → doc → ask → pause (follow-ups keep signal then jump to ask); 880Hz 0.8s beep generated locally (`assets/audio/signal.wav`, expo-audio, Expo Go compatible) with timer-owned signal fallback; unified doc panel (group, Doc X/8, écoute count, animated waveform, 5-seg strip, exact phase labels); pause yellow box + bottom strip; Illustrations transcript about the airport (answer embedded, distractors absent); timer/CTA/exit copy unchanged. Reading/writing/speaking/home/mock/history untouched.
- Verification: `tsc --noEmit` clean; `expo export --platform web` bundles wav + images; no committed test (no harness); device checks by owner.

## 2026-10-29 — Listening panel per design.png (owner review)

- Context: owner screenshots showed 4 defects vs `ListeningTest.dc.html`: oversized illustration images, narrow waveform, beep start cue, dashes counting 5 phases instead of the document's questions.
- Product change: `test/[skill].tsx` only. Signal beat is now a spoken intro via TTS (`Une nouvelle question commence.` / `Même document. Question X sur N.`), beep file + `expo-audio` usage removed; panel matches design (`GROUP · DOCUMENT X / 8`, écoute label, full-width 40-bar waveform + clock, dashes = this document's question count with design colors, `Ce document sert N questions · question X`); kicker pill, per-phase spoken card with headphone icon (design titles/subs, yellow in pause), in-flow strip pill with design copy incl. urgent + answered variants; illustration tiles at design size (104px, radius 13, badge 28) with photos kept opaque when locked; top row `Question X sur 9` + group.
- Verification: `tsc --noEmit` clean; `expo export --platform web` bundles images, no wav; no committed test (no harness); device checks by owner.

## 2026-10-29 — Listening: drop guidance card, sticky bottom strip (owner review)

- Context: owner flagged the phase guidance card must never appear during listening (`bugs/need-delete.png`) and the bottom line must be sticky-bottom + centered per `ListeningTest.dc.html` footer (`position:absolute;bottom:0` + fade + 44px centered pill).
- Product change: `test/[skill].tsx` only. Removed the spoken guidance card from every phase (mock shows panel + options + strip only); bottom strip is now an absolute footer with fade and a centered pill, visible in all phases with design copy.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Listening result screen (owner review)

- Context: owner asked for this flow's result screen; design authority is `TestReview.dc.html` (dark hero, gold donut, CORRECT/MISSED stats, Your answers list), demo-scoped by the no-fabrication rule.
- Product change: `test/[skill].tsx` complete stage only. Added CORRECT/MISSED stats under the X/9 donut, `Your answers` list with per-question Your-answer vs Correct letters (unanswered = missed); no NCLC, no explanations, no transcript. Retour/Recommencer + save-once unchanged.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Listening complete becomes session handoff (owner review)

- Context: owner corrected the result screen: a mock skill end is a confirmation handoff to the next skill, not a full answer review (that lives in Test Review). Design authority is `mock-session.js` handoff (rail, kicker, title, next-skill card, white CTA, no per-question answers).
- Product change: `test/[skill].tsx` complete stage only. Removed stats + Your-answers list; kept the X/9 donut as the result confirmation; added 4-dot session rail, `Compréhension orale terminée`, next-skill card (Compréhension écrite) with white `Commencer maintenant` routing to `/test/reading`; Retour/Recommencer kept as ghost row; save-once unchanged. No auto-advance countdown yet (next-skill UI still a stub; arrives with full session chaining).
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Listening demo: 8 documents, 9 strict-mock questions

- Milestone: Listening demo rebuilt as 8 documents / 9 questions A-H with the strict mock mechanic (autoplay, locked options, 10s pause countdown, auto-advance, real 10:00 clock, per-question review at the end).
- Product change: `content/exam.ts` (`LISTENING_DEMO`, new French transcripts verified against options; Illustrations uses the 4 design images), `test/[skill].tsx` (doc/ask/pause phase machine, 2x2 image grid, review list, Retour/Recommencer; reading/writing/speaking/home/mock/history untouched). Interview F1/F2 prompts, options, and answers are the design QSET verbatim; only its dialogue is newly authored (distractors excluded). Images: bus-stop 6.9MB compressed to 163KB, ferry webp converted to jpg (iOS cannot render webp); total ~400KB.
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes including bundled images; no committed test (no harness); device checks by owner.
- Redirect: owner direction 2026-10-29 — splash TEMP bypass, package files, `test/[skill]`, scope doc stay uncommitted; no push. Next: UI of the 4 skills per design.

## 2026-10-29 — Test screens follow design chrome

- Milestone: `test/[skill]` rebuilt in the design test-engine visual language for all 4 skills; demo function unchanged.
- Product change: fixed chrome (close X, skill title, per-skill progress bar for choice skills); paginated choice flow (one question per screen, letter badges A-D, picked ring, Next gated on answer); consigne + document/passage cards; sticky CTA with fade; exit confirm sheet. New `components/ExitSheet.tsx`, `components/StickyCta.tsx`. No audio waveform, timer, navigator grid, or review states (no models behind them in stage 0).
- Verification: `tsc --noEmit` clean; `expo export --platform web` compiles all routes; device rendering confirmed only by owner screenshots.

## 2026-10-29 — Dev screen gallery (owner review speed)

- Context: owner asked for a fast way to preview screens mid-build without replaying flows.
- Product change: new unlisted `app/dev.tsx` (`__DEV__` only) with one-tap links to every Listening state (consignes, Q1 all 5 phases, text Q, Interviews follow-up, handoff ×3 score patterns) + other skill stubs; `test/[skill].tsx` accepts `stage`/`li`/`phase`/`picked` params strictly validated, defaults unchanged when absent.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Reading demo rebuild (owner review)

- Context: owner moved to Reading with a strict no-invention rule; scope-decisions fixes the demo at 2-3 questions.
- Product change: `test/[skill].tsx` reading branch + `exam.ts` (`READING_RULES`, `READING_GROUP`) only. Kept the existing 2-question library sample verbatim; added consignes (demo-adapted rule 1, design rules 2-4 verbatim), passage screen with word count, question screen with passage pill sheet, free navigation (Back + numbered navigator sheet), answers modifiable, gated CTA (Question suivante / Terminer ce groupe), 5:00 timer from passage with auto-finish, exit sheet rows, English handoff to Writing. Listening untouched.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Reading footer per design (owner review)

- Context: owner corrected the question screen: the document pill and Back live in the sticky footer, not in the content.
- Product change: `test/[skill].tsx` reading question stage only. Content is now kicker + question + options; sticky footer holds `Je ne sais pas` (skip without answering), the document pill with book icon (opens the passage sheet), round Back (to passage, per design) + CTA (Question suivante / Terminer ce groupe). Flow stays consignes -> passage -> questions.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Reading 6-question spec rebuild (owner review)

- Context: owner ordered strict compliance with `docs/contest/reading-spec.md` (6 questions, 5 groups, 4 types, 10 minutes).
- Product change: `exam.ts` reading data replaced (3 documents, 6 questions Q1-Q6, exact design chart/gap/article content; Q1 title/source, Q3 text and Q5 doc/question authored per spec order); `test/[skill].tsx` reading branch rebuilt (spec consignes/chrome/timer, passage reader with title+source+serif, kicker/qText/gap-box/chart-card per type, spec option styles, footer with skip + doc bar + back + CTA, Terminer confirmation sheet, navigator with first-unanswered jump, spec exit sheet with unfinished-save, spec complete with ring/list/stats/3 CTAs). Listening untouched. Deviations from spec are listed in the session report.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks + 8 screenshots by owner.

## 2026-10-29 — Reading sheets + header underline per template (owner review)

- Context: owner screenshots showed the document modal, the header underline and the Questions modal diverging from `ReadingTest.dc.html`.
- Product change: `test/[skill].tsx` reading only. Passage sheet rebuilt to the template (fixed-height sheet, kicker + serif title header, X close circle, scrollable paras, blurred backdrop, no Fermer); navigator rebuilt (title `Les 6 questions`, 6-col grid, 3-state legend, jump button with question number, `Retour à l'épreuve`, blurred backdrop); header underline now a 3px-offset rule matching the design offset. Confirm sheet shares the new backdrop.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Reading complete in English (owner review)

- Context: owner flagged the Reading result screen repeating the Listening mistake: result screens are English.
- Product change: `test/[skill].tsx` reading complete only. Title `Reading complete`, stats SCORE / TIME USED / QUESTIONS, buttons `Continue: Writing` / `View results` / `Restart`, English demo note. Test flow (consignes, questions, sheets) stays French; X/6 + per-question list kept per spec.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Pure session handoff on both end screens (owner review)

- Context: owner chose the design.png handoff standard for skill ends: no per-skill score or answers on the end screen (results live in Test Review), 15 s countdown with auto-advance, one white button.
- Product change: `test/[skill].tsx` complete stages only. Listening + Reading ends now share the pattern: rail, kicker, title, no-pause body, next-skill card with live 0:15 countdown, gold hold note, single `Start now`. Removed both donuts, the Reading answers list/stats/ghost rows and dead states/styles. Scores are still saved once per skill for the future Test Review.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Reading group-break scores screen (owner review)

- Context: owner flagged the flow missing the design group-break screen with correct/incorrect counts (`bugs/design-review.png`).
- Product change: `test/[skill].tsx` reading only. Added the `break` stage after validated Terminer: check badge, `{last group} terminé`, demo-adapted body, stats card (CE GROUPE 0-1/1, TOTAL X/6, TEMPS RESTANT paused per design), navy `Passer au groupe suivant` to the handoff with answered/minutes note. Finish still saves once at validation; timer pauses on break per design.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Writing mock rebuild per design (2 tasks, pending handoff)

- Context: owner asked for the Writing UI per WritingTest.dc.html after committing Reading; mock mode skips per-tâche intros, straight into the field, and the pending screen hands to the next skill.
- Product change: `test/[skill].tsx` writing branch + `content/exam.ts` (`WRITING_TASKS` both real tasks with 80/200 minimums, `WRITING_RULES`, `WRITING_NOTE`, `WRITING_ACCENTS`, `WRITING_CRITERIA`) + `app/dev.tsx` gallery only. Flow: consignes (dark, épreuve 3 sur 4, 10-min demo note) → write (consigne + document card, plain-text editor, accent row inserting at cursor, live word count + progress + save chip, 1-min warning banner) → review per task (VOTRE TEXTE, edit back) → submit recap (both word counts, 4 AI criteria) → pending (dark CORRECTION screen, manual/auto copy, `Continuer : Expression orale` with 15 s auto-advance to Speaking). 10:00 clock starts at the field, auto-sends as-is at zero, saves once. Listening/reading/speaking/home/mock/history untouched.
- Deviations disclosed: 10-min demo clock (design 60); drafts start empty (design seeds); no desktop/QR offer; no confirm sheet (design submit screen is the confirm); pending shows real word totals instead of a fake clock/ETA; CTA icons reuse in-app glyphs (no alert/file-check SVGs in the set); exit sheet states the unsent draft is lost (no resume yet).
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.

## 2026-10-29 — Speaking stub mock per design (2 tasks, session end)

- Context: last skill of the mock; scope keeps it a non-working stub (no mic recording, no AI scoring).
- Product change: `test/[skill].tsx` speaking branch + `content/exam.ts` (`SPEAKING_TASKS` both TEF sections with design examiner cues, `SPEAKING_RULES`, `SPEAKING_NOTE`, `SPEAKING_CRITERIA`) + `app/dev.tsx` gallery only. Flow: consignes (dark, épreuve 4 sur 4) → intro (dark, consigne + document + meta rows incl. Réenregistrement Non autorisé) → prep (60 s countdown ring, auto-starts record at zero, skippable) → record (dark, live cue card À VOUS/L'EXAMINATEUR with next-cue countdown, count-up clock to the task limit with auto-stop, illustrative waveform, stop square + gated CTA) → review (measured duration rows, editable demo transcript, no re-record, no fake player) → submit recap (measured durations, 4 AI criteria) → pending (dark, `Voir le résultat de la session` to /result; no auto-advance, session review screen does not exist yet). Saves once. Listening/reading/writing untouched.
- Deviations disclosed: no session clock (nothing to cut mid-take); no real recording or mic permission — stub note on the record screen says the timer simulates the take; waveform is illustrative, not live mic levels; prep ring is a plain bordered circle (no conic gradient); exit sheets reuse the light sheet component with design copy; pending shows no fake clock/ETA beyond the design's own ranges.
- Verification: `tsc --noEmit` clean; `expo export --platform web` ok; device checks by owner.
