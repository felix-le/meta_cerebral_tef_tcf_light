# Contest MVP — scoring rubric (FINAL)

> Status: **FINAL, approved by the owner on 2026-10-27.** The rubric follows the exam organisers' public requirements (CCI Paris Île-de-France for TEF, France Éducation international for TCF). Direction 1 chosen: a level-based rubric built from the public
> CCI / FEI descriptors. The overall level becomes a /450 range labelled **Estimation**. No criterion weights are invented.
> Applies to TEF Canada Writing (EE) and Speaking (EO). **Contest build: Writing section B (point de vue, ≥ 200 words)
> and Speaking section B (present and convince, with an AI debate partner, §3.3)** — chosen 2026-10-26. Section A rows
> are kept for later.
> Machine contract: [`feedback.schema.json`](feedback.schema.json).

## 1. What the official sources say (and do not say)

| Fact | Source |
|---|---|
| Writing is marked by two independent correctors with a standardised grid. The grid gives **one overall performance level on the CEFR scale (A1–C2)** "thanks to the different criteria". | CCI, *Exemples de sujets TEF – Expression écrite* (public) |
| Writing criteria come in two groups. Text quality: respect of the situation; overall organisation; clarity of the information or argument; ability to develop, nuance and make precise. Language: lexicon; syntax (sentences, tenses, moods); spelling. | same |
| Writing A: continue a news article, ≥ 80 words, 25 min. Writing B: give and justify a point of view, ≥ 200 words, 35 min, at least 3 arguments. | same · `docs/exam-format.md` |
| Speaking A (5 min, "obtain information" by phone) has 3 communicative criteria: relevance of the questions; initiative and handling the unexpected; quality of the exchange. | CCI, *Livret de l'examinateur TEF EO 2024* (public PDF) |
| Speaking B (10 min, "present and debate" with a friend) has 3 communicative criteria: presentation of the facts; quality of the argument; quality of the exchange. | same |
| Oral criteria also cover linguistic, pragmatic and sociolinguistic skills. | FEI, *Évaluation des épreuves* |
| **Not published:** points or weights per criterion, and how criteria combine into the level. The detailed grids are images in the booklet, marked as not for reproduction. The CCI grid file labelled "confidentiel" is **not used**. | — |

So the rubric copies only the **criterion names** (facts). The level descriptors in §3 are our own wording, written
against the public CEFR scale. Nothing here reproduces CCI grid text.

## 2. How a score is produced

1. **The model rates each criterion** with one CEFR level (A1–C2), a short comment and 1–3 quotes from the learner's
   text as evidence. A criterion it cannot observe is `notAssessed` (with the reason), never guessed.
2. **The model gives one overall level**, holistically, as the official grid does. Where the level spans two NCLC bands
   (B1, B2, C1), it also says `lower` or `upper` half. The app checks consistency only: the
   overall level must lie between the lowest and the highest level of the **assessed** criteria (`notAssessed` ones are
   left out of the check), else the response is rejected and retried.
   No weights, no averaging.
3. **The app (not the model) turns the level into numbers**, from the official TEF Canada NCLC table
   (`docs/exam-format.md`, EE and EO are the same table) and the CEFR ↔ NCLC correspondence of D13.1:

| Overall level | Half | NCLC | Score range /450 | Shown as |
|---|---|---|---|---|
| A1 | — | 1–3 | 0–180 | "Estimation · NCLC 1–3 · ≤ 180 / 450" |
| A2 | — | 4 | 181–225 | "Estimation · NCLC 4 · 181–225 / 450" |
| B1 | lower | 5 | 226–270 | |
| B1 | upper | 6 | 271–309 | |
| B2 | lower | 7 | 310–348 | |
| B2 | upper | 8 | 349–370 | |
| C1 | lower | 9 | 371–392 | |
| C1 | upper | 10 | 393–415 | |
| C2 | — | 11–12 | 416–450 | |

   The screen shows the **range**, never a single exact score, plus "NCLC n · CEFR" and the word **Estimation**.
   The app keeps the table in config, not in UI code. If one point is needed (a chart), it uses the middle of the range.
4. **Word count is computed by the app**, not the model: below the floor (80 for A, 200 for B), the screen warns
   before submission and the feedback repeats it. No penalty is invented. The model judges the effect through
   "respect of the situation" and "development".

## 3. Criteria and level descriptors (our wording)

Each criterion gets one level. The descriptors anchor the model's judgement. They are written in English for the prompt;
the learner sees English comments plus French quotes and corrections (exam content stays French).

### 3.1 Writing (EE) — sections A and B

| id | Group | Criterion (official name) | A1–A2 | B1 | B2 | C1–C2 |
|---|---|---|---|---|---|---|
| `situation` | task | Respect de la situation | Task partly or not done; wrong text type or register | Task done; text type and reader mostly respected; A: follows on from the article | Task fully done; register suits the reader; A: consistent with the article's facts and tone | Fully adapted to reader and purpose throughout |
| `organisation` | task | Organisation générale du texte | List of sentences, little or no structure | Paragraphs and simple connectors (et, mais, parce que, d'abord) | Clear plan, varied connectors, logical progression | Seamless structure, the plan serves the argument or story |
| `clarity` | task | Clarté de l'information ou de l'argumentation | Hard to follow, confusing | Mostly clear, some unclear passages | Clear and easy to follow | Clear and precise, no effort needed |
| `development` | task | Développer, nuancer, préciser | Bare facts or opinion, no support | Some details or examples; B: arguments mostly listed, fewer than 3 developed | Details and examples; B: at least 3 developed arguments, some nuance | Rich, nuanced, anticipates objections |
| `lexicon` | language | Lexique | Basic, repetitive, frequent wrong words | Enough for the topic, some repetition and approximations | Varied and mostly precise | Precise, idiomatic, nuanced |
| `syntax` | language | Syntaxe (phrases, temps, modes) | Simple sentences, frequent errors that block meaning | Simple and some complex sentences; errors with complex forms | Complex sentences mostly controlled; tenses and moods (incl. subjunctive) mostly right | Consistently controlled, rare slips |
| `spelling` | language | Orthographe | Frequent errors, some block meaning | Usual words mostly right; agreement errors | Few errors, rarely on agreements | Near error-free |

### 3.2 Speaking (EO) — scored from the transcript only

The learner records, Muse Voice Transcribe returns a transcript, the learner can correct transcription mistakes, then
the transcript is scored. For section B the scored transcript is the **whole conversation**, AI turns included (§3.3). **Not assessed, and never claimed:** pronunciation, intonation, fluency or speed
(no word-level timestamps, `HANDOVER-CLAUDE.md` §5).

| id | Group | Section | Criterion (official name) | A1–A2 | B1 | B2 | C1–C2 |
|---|---|---|---|---|---|---|---|
| `questioning` | interaction | A | Pertinence du questionnement | Few, very general questions | Questions on the main points of the ad | Many relevant questions, covers the topic | Thorough, well-targeted questions |
| `initiative` | interaction | A, B* | Prise d'initiative / gestion de l'imprévu | Waits, does not react | Reacts to simple surprises | Asks for clarification, bounces back | Steers the call with ease |
| `presentation` | task | B | Présentation des faits | Reads or lists a few words of the document | Presents the main information simply | Clear presentation with the key details | Clear, structured, well-chosen detail |
| `argumentation` | task | B | Qualité de l'argumentation | One simple argument or none | Several arguments, little developed | Developed arguments with examples, answers objections | Convincing, nuanced, adapts to the listener |
| `exchange` | interaction | A, B | Qualité des échanges | Isolated words or sentences | Keeps a simple exchange going | Natural turn-taking, follows up | Fluent, flexible interaction |
| `lexicon` | language | A, B | Lexique | Basic, many gaps | Enough for the topic | Varied, mostly precise | Precise, idiomatic |
| `grammar` | language | A, B | Morphosyntaxe | Frequent errors that block meaning | Simple structures mostly right | Complex structures mostly controlled | Consistently controlled |
| `register` | language | A, B | Registre (sociolinguistique) | Register not adapted | Polite forms mostly right (vous / tu as asked) | Register suits the role | Fine shifts of register |

\* `initiative` is a section A criterion in the CCI booklet; section B lists only presentation, argumentation and
exchange. The contest build also scores it in section B, from how the learner handles the AI partner's objections
(decided 2026-10-26). README and video must not present it as an official section B criterion.

### 3.3 Speaking B — AI debate partner (contest build)

Both TEF sections are a live exchange, so the contest build gives the learner an interlocutor (decided 2026-10-26).

**Role (Muse Spark, a separate prompt from the scorer):**
- Plays the **friend the learner must convince**, not an examiner: never scores, never comments on level during the talk.
- Speaks French; each turn is short (1–3 sentences) and makes **one** objection or **one** challenging question.
- Never gives the learner arguments or answers, never corrects mistakes mid-conversation (corrections come on the
  feedback screen).
- Stays on the document's topic; uses `tu` (friend role, as in the real section B).

**Flow:**
1. The learner reads the document (an ad), then records the presentation + first arguments.
2. The transcript appears; the learner may fix transcription mistakes.
3. The AI partner answers **in text** (an objection or a question).
4. The learner records a reply → transcript → AI answers again.
5. **At most 3 learner turns** in the demo, then the conversation goes to scoring.
6. The screen labels the partner **"Examinateur IA (démo)"** and says it is not a real examiner.

**Scoring:** the scorer receives the whole conversation (AI turns and learner turns, marked by speaker) and scores only
the learner. `initiative` and `exchange` are judged from how the learner reacts, links to the previous turn and answers
objections. Same limits as §3.2: transcript only, no pronunciation or intonation.

**Fallback:** if the multi-turn loop is not stable by **2 November 2026**, the build goes back to a single recording:
`initiative` and `exchange` are `notAssessed`, the screen says so, and no interaction score is invented.

## 4. What the learner sees

1. **Estimation**: "NCLC 7 · B2 · 310–348 / 450", with one line: "Estimation from an AI reading of your text, not an
   official score."
2. **By criterion**: each criterion's level, a comment, and a quote from the text.
3. **Corrections**: each error with the original, the correction, the type (grammar, vocabulary, spelling, punctuation,
   register) and a one-line explanation.
4. **Better phrasing**: 2–5 rewrites of the learner's own sentences, with why each is better.
5. **Strengths** (1–3) and **next steps** (1–3).
6. Writing: word count with the floor. Speaking: "Scored from your transcript; pronunciation is not assessed."
   Speaking B also shows the conversation with the "Examinateur IA (démo)" turns.

## 5. Calibration and honesty

- Before the demo, run the scorer on a few texts at known levels (e.g. sample texts from public CEFR material) and check
  the level comes out within ±1. Record the result here.
- README and video say: estimation only, transcript-based for speaking, no official grid used, criterion names from
  CCI/FEI public documents.

## Sources
- CCI Paris Île-de-France, *Exemples de sujets TEF – Expression écrite* (2024):
  https://www.lefrancaisdesaffaires.fr/wp-content/uploads/2024/10/tef-exemples-epreuve-ee.pdf
- CCI Paris Île-de-France, *Livret de l'examinateur TEF – expression orale* (2024):
  https://lefrancaisdesaffaires.fr/wp-content/uploads/2024/12/2024-livret-de-examinateur-tef-eo.pdf
- France Éducation international, *Évaluation des épreuves*:
  https://www.france-education-international.fr/article/evaluation-epreuves-tcf?langue=fr
- Score bands: `docs/exam-format.md` (IRCC TEF Canada table) · CEFR ↔ NCLC: `docs/decisions.md` D13.1
