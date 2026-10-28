# Contest scope decisions — cleared 2026-10-28
> This note resolves contradictions found in the older docs on 2026-10-28.
> When an older doc disagrees with this note, THIS NOTE WINS for the contest build.
> It does not rewrite the locked brand/rubric files; it tells the builder how to read them.
> Project runs entirely with Muse Code. Product APIs are only Muse Spark + Muse Voice Transcribe via the Meta Model API. No Anthropic/Claude API in the app.

## 1. Missing references — now fixed, and what NOT to copy
- `docs/exam-format.md` is now in this repo. Its TEF Canada NCLC table (EE/EO /450) matches rubric.md section 2 exactly, and its section "NCLC -> CEFR (display, D13.1)" is the D13.1 mapping: NCLC 1-3 -> A1, 4 -> A2, 5-6 -> B1, 7-8 -> B2, 9-10 -> C1, 11-12 -> C2. Do not copy the whole old `docs/decisions.md` (68 KB of old-app decisions) just for D13.1.
- `docs/contest/name-check.md` is now in this repo. It is preliminary only, not legal advice. USPTO, EUIPO and Google Play were NOT checked.
- `HANDOVER-CLAUDE.md` is NOT copied and must NOT be used as a reference in this repo. It is superseded by the Muse Code exchange plan and the Stage 0 brief. Its name and its Claude-specific content do not apply here.
- The original design folder `design/TEF TCF Prep design setup/` is NOT copied. The only design authority is `design/prepa-contest-final/` (11 screens). The original folder contains removed screens (Shop, Profile, Collection, Leaderboard, Statistics) that must not come back.
- The root `README.md` in this repo is OUTDATED in two places: where it says the app is only 2 skills (see decision 2), and where it says "Production UI is French" (see decision 5: app UI is English, exam is French). Update that README before submission, do not let it override the scope.

## 2. Scope — TEF Canada ONLY, and all 4 skills present because the contest runs a mock test
- Exam type: TEF Canada ONLY in the contest demo. No TCF exam, no TEF/TCF switch, no TCF tasks or scores anywhere in the built app (see decision 3).
- Home shows FOUR skill cards (Listening, Reading, Speaking, Writing), and the Mock Test flow must traverse ALL FOUR skills in one sitting, because the contest demo runs a mock test — not just two isolated skill practices.
- In the mock sitting, in order: Listening, Reading, Writing section B, Speaking section B. Results are published together in History / TestReview, and the usable level is the weakest skill.
- Depth in the contest demo (CONFIRMED by the owner 2026-10-28 10:48): SHORTENED MOCK. Speaking section B and Writing section B are FULL, with AI scoring. Listening and Reading inside the mock are WORKING sections, shortened to 2-3 questions each, with a clear in-app note that the full 40-question Listening / 40-question Reading version will be public after the app launches. A shortened mock is still a real mock flow (all 4 skills, submit, results together); it is NOT four dead screens and NOT a claim of a full 175-minute exam.
- REJECTED alternative: full exam-length mock (Listening 40 + Reading 40 + Writing 2 taches 60 min + Speaking 2 parts 15 min = 175 min). Do not build it on the current dates.
- Mock Test sessions are free. History keeps results on this device. Detailed Analysis is always open and free.

## 3. TEF or TCF — scored content is TEF Canada only
- Brand name stays "Prepa TEF TCF". Scoring, rubric and sample content in the contest build are TEF Canada only.
- Rubric.md applies to TEF Canada Writing (EE) and Speaking (EO). Its section 3 criteria are TEF criteria. There is no TCF scoring in this build.
- Never show TCF scores: no /699, no /20, no TCF task counts. Design README already moved History mock tests to TEF because the result screen only has TEF samples (Writing 2 taches; TCF has 3).
- WARNING — do not copy SpeakingTest.dc.html data verbatim: it still contains a full TCF_TASKS set (3 taches) and scripted, clock-cued examiner turns. Those are legacy design data, not contest scope and not the AI partner (see decision 8).

## 4. Schema old name — fixed
- `feedback.schema.json` $id was `voix-plume/feedback-model-output/1.0` (name dropped 2026-10-26). Fixed 2026-10-28 to `prepa-tef-tcf/feedback-model-output/1.0`. No other field changed.
- The words "Voix & Plume" in brand.md history are history only ("dropped, do not use"), not an active name.

## 5. Language — CORRECTED 2026-10-28 10:49 (owner): app UI is ENGLISH, exam is FRENCH
- CORRECTION: an earlier version of this file wrongly said app UI is French. That came from the root README line "Production UI is French", which is outdated/wrong for this contest design. The design itself proves the correct split: Onboarding "Welcome / Start practising", Home "Your skills", buttons "Submit" are English; exam screens use French "Consigne", "Tache", "Expression ecrite / Expression orale" and French passages/prompts.
- App UI chrome (buttons, titles, navigation, non-exam instructions, History/Mock labels): ENGLISH.
- When a test starts, exam content is FRENCH: consigne, task title, document/passage, questions, answer options, examiner/partner turns.
- Scorer feedback comments, correction explanations, better-phrasing reasons, strengths and next steps: ENGLISH, as locked in rubric.md section 3 and feedback.schema.json. This matches the English UI, so feedback does not need translation.
- Learner quotes, original text, corrected text and rewrites: FRENCH, copied from or applied to the learner's text.
- Do NOT translate the English UI into French, and do NOT translate English feedback comments into French at Stage 0. Either change would alter the design, the schema, the rubric and the scorer prompt together — a separate decision, not a UI translation.
- Separate from app language: chat with the coding agent is Vietnamese, code/file/folder names are English (see exchange plan). Do not confuse those three layers: agent chat = Vietnamese, app UI = English, exam + learner text = French.
- Address rule (same as with Muse): the user is "chị" (older sister), the agent is "em" (younger). The agent calls itself "em" and calls the user "chị". Never call the user "em", never use generic "bạn/mình" for this relationship. The user calls the agent "em" and herself "chị".

## 6. Calibration — not a Stage 0 blocker, a Stage 1/2 gate
- Rubric.md section 5 ("record the result here") is still empty because the scorer does not exist yet. It cannot be filled before Stage 1.
- Gate before demo/video: run the scorer on a few texts at known CEFR levels, check the level comes out within +/-1, and record the result in rubric.md section 5 (or a calibration note next to it). If calibration fails, do not claim accuracy — fix the prompt and re-run, or state the limitation in README/video.

## 7. AI partner fallback — deadline 2 November 2026 STILL APPLIES
- Dynamic AI partner (rubric.md section 3.3): Muse Spark, French, 1 objection or 1 question per turn, never gives arguments or corrections mid-conversation, at most 3 learner turns, then scoring on the whole conversation.
- HARD GATE: if the multi-turn loop is not stable by 2 November 2026, switch to a single recording. Then `initiative` and `exchange` are `notAssessed`, the screen says so, and no interaction score is invented.
- The fallback is single recording, NOT the scripted clock-cued turns from the design file.

## 8. SpeakingTest design code — checked 2026-10-28, do NOT copy its flow
- Checked against `design/prepa-contest-final/screens/SpeakingTest.dc.html` (1377 lines): the design engine runs intro -> prep -> record -> review per tache, with examiner turns cued off the recording clock (e.g. TEF section B examiner lines at 40s, 240s, 480s) and a "pending — With the AI" scoring state. That is a visual mock, not a real multi-turn AI partner.
- Contest build must implement rubric.md section 3.3 instead: learner records -> transcript shown and editable -> AI partner replies in text -> learner records a reply, up to 3 learner turns -> scorer scores the whole conversation, learner turns only.
- Home hero card wording ("answer the AI examiner's objections") matches the rubric concept; the SpeakingTest clock-cued script does not. Follow the rubric, not the script.
- Design files are a visual reference (layout, colours, fonts, flow labels). Never copy their legacy props verbatim (e.g. Home still carries pro/tpc state props, placement-test cards, TCF exam data). Strip everything the scope decisions above removed. Full redundant list is decision 9 below.

## 9. REDUNDANT — things the current design still mentions, but this contest version does NOT use. DO NOT BUILD, DO NOT KEEP AS DISABLED FEATURES, DO NOT COPY THEIR DATA
The builder must delete these from the new code, not translate them, not hide them behind a flag, not keep them "for later". If a design file shows one of these, it is a leftover from the original app, not a requirement.

### 9A. Accounts and sign-in (original Onboarding had 10 screens; contest Onboarding is Splash -> Welcome -> Start practising only)
- Login, signup, forgot password, OTP, email/phone verification, signed-in gate, Profile tab, Settings account section, any user account, any server-side user record.

### 9B. Money, tokens and paywalls
- TPC / jetons in any form: balance (e.g. Home `tpc: 13`, MockTest `BALANCE` fresh 30 / active 24 / pro 96), cost chips (e.g. MockTest `cost: 18`), paying for a session, locked sessions for non-Pro users, `showPro` / PRO badge, `isPro` / `unlocked` gates.
- Pro in any form: Pro-only sessions, Pro-only explanations, "explanations locked" walls in TestReview, `hasWall`, `explainLocked`, `locked` feedback, Detailed Analysis locked behind Pro (contest: always open and free).

### 9C. Gamification and original-app engagement
- Leaderboard, streak, daily bonus (`showDailyBonus`), placement test (Home "Take your placement test" card, 20 minutes across all 4 skills), "Continue" / "Recommended" / drill cards that assume a long-term learning history, Collection of saved sets as a feature.

### 9D. Screens and flows that are NOT in the 11 contest screens
- PracticeConfig, Collection, Shop, Profile, AnswerKey as a standalone screen, Settings, Statistics, SkillDetail, TopicDetail, TpcHistory, Leaderboard, WritingTestWeb, ScreenFlow / FlowMap, and any screen from `design/TEF TCF Prep design setup/` that is not one of the 11 exported screens. Links in the design that point to these screens go to the nearest contest screen (test, result, or Home) — the target screen itself is NOT built.
- Tooltip guide (`guide.js`, `guide-data.js` — already deleted from the export), mascot Mimi, original brand tokens (warm cream neutrals, black CTA) — contest uses only the Prepa plum/gold/ink/muted/lilac/mist/paper tokens.

### 9E. Legacy data and props still inside the 11 design files (checked 2026-10-28)
- Home: `userState` fresh / solo / active / pro, `tpc`, `showDailyBonus`, placement-test and drill cards, mock-session cards that assume Pro or a balance.
- MockTest: `userState` fresh / active / pro, `lowBalance`, `BALANCE`, `cost`, `pro`, `locked` sessions, PRO badge rendering, `manyInProgress` scenario props.
- TestReview: `isPro`, `unlocked`, `hasWall`, `explainLocked`, "explanations locked" hints, feedback locked unless Pro, solo/scoring state props that gate content behind Pro.
- SpeakingTest and other screens: `examKey` tcf, `TCF_TASKS`, TCF interview data, TCF counts (39 questions), TCF scores (/699, /20), TCF task structures (3 taches).
- Any sample data that is not TEF Canada: TCF mock sessions, TCF History cards, TCF result samples. History mock tests in the contest build are TEF Canada only.
- Skill scores shown as a percentage, a single exact /450 score, or a TCF /699 score. Contest scores are: NCLC range + CEFR + "Estimation" for Speaking/Writing, count correct only for Listening/Reading preview. Percentages that are part of exam content itself (e.g. inside a Reading chart) are NOT redundant — only percentages used as a skill score are.

### 9F. What is NOT redundant (do not delete these by mistake)
- The 4 skill cards, the 4-skill mock sitting, Mock Test tab, History tab, Detailed Analysis, skill colours (Listening blue, Reading teal, Speaking purple, Writing amber — accent/ring only, never CTA background), green/red status colours, French exam passages and their fictional people, Reading chart percentages that belong to the passage.

## MOCK DEPTH — DECIDED 2026-10-28 10:48 (owner tapped "Mock rut ngan: du 4 skill, L/R 2-3 cau")
Mock = SHORTENED, all 4 skills, Speaking/Writing full, Listening/Reading 2-3 questions each, labelled as a shortened demo mock. Full exam-length mock (175 minutes) is REJECTED for this contest build. No open question remains on mock depth.

## 10. ANSWERS TO THE CODING AGENT'S FOLLOW-UP QUESTIONS — 2026-10-28 10:57 (owner forwarded them; these answers are final for Stage 0, do not re-ask them)

### 10A. Why Writing B and Speaking B only?
Because they were chosen 2026-10-26 and locked in rubric.md header: contest build = Writing section B + Speaking section B. Section A rows are kept in the rubric for later, not built now.
- Writing B: point de vue, >= 200 words, 35 min, at least 3 arguments. Writing A (continue a news article, >= 80 words) is not built now.
- Speaking B: present and debate, 10 min, with an AI debate partner (rubric §3.3). Speaking A (obtain information by phone, 5 min) is not built now.
- Reason (recorded 2026-10-26): B's presentation/argumentation are assessable from a single recording/transcript, while A's questioning/initiative/exchange are interaction-heavy and would need a live examiner. B therefore shows the AI feedback value in a minimal hackathon MVP. Do not add section A in Stage 0.

### 10B. Why is HANDOVER-CLAUDE.md still mentioned if it was cleared?
It was a real dangling reference, and the agent was right to flag it. Fixed 2026-10-28, do not re-ask:
- brand.md: the two HANDOVER references are replaced with `docs/contest/scope-decisions-2026-10-28.md` (this file, which supersedes the old handover) and with the accent rule in 10C below.
- rubric.md: the HANDOVER §5 reference is replaced with §3.2 itself, which already states the transcript-only rule.
- The HANDOVER file itself is still NOT copied into this repo and must NOT be used. Its relevant facts (name chosen 2026-10-26, transcript-only scoring) are already captured in brand.md, rubric.md and this file.
- If any other file in this repo still cites HANDOVER-CLAUDE.md, treat that citation as superseded by this file and report it, do not fetch the old file.

### 10C. UI English or French? — ENGLISH for UI, FRENCH for exam. Decision 5 stands.
- The agent correctly spotted a conflict: an older session rule said "learner-facing content stays French". That rule is REINTERPRETED, not overturned, as follows: learner-facing EXAM content stays French; learner-facing UI chrome does not.
- Owner decision 2026-10-28 10:49, confirmed again here: app UI = ENGLISH (buttons, titles, navigation, History/Mock labels, e.g. "Welcome / Start practising", "Your skills", "Submit"). Exam = FRENCH from the moment a test starts (consigne, task, document, questions, options, partner turns, e.g. "Consigne", "Tache", "Expression ecrite / Expression orale").
- The root README line "Production UI is French" is therefore outdated for this contest design and must be updated before submission. Do not use it to override decision 5.
- Feedback comments stay ENGLISH (matches the English UI); learner quotes and corrections stay FRENCH.

### 10D. Brand name accent — display "Prépa", identifier "prepa" (no accent)
- Display everywhere a human reads it: "Prépa TEF TCF" WITH the accent, exactly as in brand.md and the logo wordmark. Never write "Prepa" on UI, splash, Home, results, README display text or video.
- The unaccented "Prepa" / "prepa-tef-tcf" in decision 3 of this file and in schema $id is ASCII only, for identifiers: file names, folder names, code identifiers, schema $id, URLs. Accents are not allowed there, so the identifier form is not a UI spelling.
- Rule in one line: humans see "Prépa", machines see "prepa".

### 10E. Tile colours — brand table wins for backgrounds, skill colours only for accent
- Tile backgrounds follow brand.md (locked 2026-10-27): Speaking tile background = plum #6A2A5F (white text), Writing tile background = gold #F9BD48 (dark ink text only, never white on gold).
- Skill colours are a SEPARATE system: Listening blue #4A7FE5, Reading teal #1A9E94, Speaking purple #8B62E0, Writing amber #D4860F. Use them ONLY for icon / ring / dot accent, never as a tile background and never as a CTA background.
- So a Speaking tile is: plum background + purple icon/ring accent. A Writing tile is: gold background (dark text) + amber icon/ring accent. Decision 9F's "accent/vien only" refers to skill colours, not to brand tile backgrounds — do not read it as forbidding plum/gold tiles.

### 10F. "AI examiner" wording — fix the Home hero, keep the rubric label
- Rubric role is authoritative: the partner plays the FRIEND the learner must convince (tu, informal), never an official examiner, never scores or comments on level during the talk.
- Home hero copy in the design ("answer the AI examiner's objections") is therefore WRONG for the built app. Change hero copy to the partner wording, e.g. "answer your AI partner's objections" / "convince your AI partner". Do not keep "examiner" as the partner's role in hero copy.
- Keep the exact rubric label where rubric §3.3 mandates it: on the conversation/result screen, label the partner "Examinateur IA (demo)" and state it is not a real examiner. That French label is a mandated screen label, not a change of role — the partner still behaves as a friend in the conversation.
- In short: behaviour = friend, hero copy = partner, mandated screen label = "Examinateur IA (demo)" with the demo disclaimer.

### 10G. New files not committed — commit them now, as a separate docs commit, after owner approval
- Files untracked outside the init commit: `docs/contest/scope-decisions-2026-10-28.md`, `docs/exam-format.md`, `docs/contest/name-check.md`, plus the edits in this round to brand.md, rubric.md and scope-decisions itself (including decision 10).
- Recommendation, to be confirmed by the owner in one line: COMMIT them now, in a separate commit (e.g. "docs: contest scope decisions and references"), BEFORE any scaffold code, so the next session starts from a clean committed state. Do NOT mix docs and code in one commit, and do NOT push public until the repo name is confirmed with Felix.
- If the owner says "leave them", then leave them untracked and do not commit — but do not start scaffold code on top of uncommitted docs without saying so in the Stage 0 report.
