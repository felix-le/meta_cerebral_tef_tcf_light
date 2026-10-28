# Exam format — source of truth

> Derived from `design/TEF TCF Prep design setup/PRD/TEF_TCF_Prep_PRD.md` (v2.4, "Exam Format")
> and the research files in `design/`. Verified against CCI Paris IDF, France Éducation
> International and IRCC. **No code, config or AI prompt may use other numbers.**
> In code these numbers live in server config / seed data — never in UI constants.

## Supported exams
| Exam | Body | Status |
|---|---|---|
| **TEF Canada** | CCI Paris Île-de-France | **Build first** |
| TCF Canada | France Éducation International | Later, same app |

## Comprehension
| | TEF Canada | TCF Canada |
|---|---|---|
| Listening (CO) | 40 questions · 40 min | 39 questions · 35 min |
| Reading (CE) | 40 questions · 60 min | 39 questions · 60 min |
| Options | 4, one correct | 4, one correct |
| Difficulty order | mixed | ascending |
| Listening plays (exam) | 1 or 2 **per document**, announced by the consigne | always 1 |
| Listening back navigation | never | never |
| Reading back navigation | allowed (free movement) | allowed |

### TEF Listening — 7 item groups (40)
Illustrations (image MCQ 2×2, TEF-only) 4 · Annonces publiques 4 · Micro-trottoirs 6 ·
Chroniques radio 2 · Interviews 6 · Reportage 1 · Documents divers 10.

### TEF Reading — 5 item groups (40)
Documents du quotidien 7 · Phrases lacunaires 10 · Lecture rapide (textes et graphiques) 5 ·
Documents administratifs et professionnels 10 · Article de presse 8.
(Prep centres also describe 7 sections A–G for the same 40 items; never show section letters on screen.)
Mock content split (estimate — CCIP publishes only the group totals): everyday documents 7 · sentence-gap 5 + text-gap 5 ·
quick reading 3 texts + 2 charts · administrative/professional 10 · press articles 8.

Question types in use (D8.18): `text-mcq` · `sentence-gap` (phrases lacunaires) · `text-gap` (textes lacunaires) ·
`chart-document-mcq` (graph as the document). Answers are always one of 4 options. "Choose the matching chart" is NOT used
(unverified interaction). **Legacy (removed Dec 2023, never in a mock):** sentence ordering,
phrases synonymes — tag `legacy-pre2023`. True/False: unconfirmed, do not build.

## Production (not in MVP — reference only)
| | TEF Canada | TCF Canada |
|---|---|---|
| Writing (EE) | 2 tâches · 60 min: fait divers ≥ 80 words; point de vue ≥ 200 words (floors, no ceiling) | 3 tâches · 60 min: 60–120 / 120–150 / 120–180 words |
| Speaking (EO) | 2 parts · 15 min: A 5 min, B 10 min, 1 min prep each, live role-play | 3 tâches · ~12 min: 2:00 / 5:30 (2:00 prep) / 4:30 |

## Score scales
| | Listening | Reading | Writing | Speaking |
|---|---|---|---|---|
| TEF Canada | /360 | /300 | /450 | /450 |
| TCF Canada | /699 | /699 | /20 | /20 |

No composite score exists. IRCC converts each skill separately; the usable level is the weakest skill.
**IRCC trap (show in-app wherever an NCLC estimate appears):** TEF attestations show `Score /699` and
`Équivalence ancien score` — IRCC requires the **Équivalence ancien score**.

## NCLC — TEF Canada (full table)
| NCLC | Reading CE /300 | Listening CO /360 | Writing EE /450 | Speaking EO /450 |
|---|---|---|---|---|
| 1–3 | ≤ 120 | ≤ 144 | ≤ 180 | ≤ 180 |
| 4 | 121–150 | 145–180 | 181–225 | 181–225 |
| 5 | 151–180 | 181–216 | 226–270 | 226–270 |
| 6 | 181–206 | 217–248 | 271–309 | 271–309 |
| 7 | 207–232 | 249–279 | 310–348 | 310–348 |
| 8 | 233–247 | 280–297 | 349–370 | 349–370 |
| 9 | 248–262 | 298–315 | 371–392 | 371–392 |
| 10 | 263–277 | 316–333 | 393–415 | 393–415 |
| 11–12 | 278+ | 334+ | 416+ | 416+ |

### NCLC → CEFR (display, D13.1)
NCLC 1–3 → A1 · 4 → A2 · 5–6 → B1 · 7–8 → B2 · 9–10 → C1 · 11–12 → C2 (common correspondence; CEFR is secondary).

## NCLC — TCF Canada (IRCC, checked 2026-10-12)
| NCLC | Reading /699 | Listening /699 | Writing /20 | Speaking /20 |
|---|---|---|---|---|
| below 4 | 100–341 | 100–330 | 0–3 | 0–3 |
| 4 | 342–374 | 331–368 | 4–5 | 4–5 |
| 5 | 375–405 | 369–397 | 6 | 6 |
| 6 | 406–452 | 398–457 | 7–9 | 7–9 |
| 7 | 453–498 | 458–502 | 10–11 | 10–11 |
| 8 | 499–523 | 503–522 | 12–13 | 12–13 |
| 9 | 524–548 | 523–548 | 14–15 | 14–15 |
| 10+ | 549–699 | 549–699 | 16–20 | 16–20 |

IRCC publishes NCLC 4 → 10+ only: it does not split 10 / 11 / 12 for TCF Canada and has no band below 4.
The "below 4" row is derived (under the NCLC 4 floor); the app labels it "1–3" like TEF and the top row "10+" (D15.2).
CE / CO scores run 100–699. Source and citations: `docs/research/tcf-canada-nclc.md`.

### TCF Canada Reading — structure (FEI, checked 2026-10-12)
39 MCQ · 4 options (A–D), one correct · 60 min · **progressive difficulty** (A1 → C2) · documents from everyday
notices, ads, menus and timetables to opinion articles and long literary / specialised texts.
FEI publishes **no question count per CEFR level and no per-question weights**; the weights quoted by prep
sites are unofficial and not used (D15.3).

## Raw score → scaled score
No official public table. **For now: mock conversion** (decision D4.3). A real, clearly labelled
estimate table will be added later.

## Content tagging
Every content item carries `formatVersion`: `tef-2023-12` · `tcf-current` · `legacy-pre2023`.
Mock tests only contain items of the exam's current format version.
