# Prépa TEF TCF: final contest design

**Status: FINAL. The owner approved the logo and this design on 2026-10-27.** App code follows this folder.

Exported on 27 Oct 2026 from the design canvas (version 40). The design is the original app
design (`design/TEF TCF Prep design setup/`) with these changes:
- **Branding.** The logo, the logo colours (plum `#6A2A5F`, gold `#F9BD48`, ink `#2E1A3B`) and the name Prépa TEF TCF. The fonts are unchanged.
- **Colours.** The original warm neutrals were moved to plum tints (for example `#1A1A1A`→`#2E1A3B`, `#E6DCEE`→`#EFE3EC`, `#F5F1F8`→`#F8F3F7`, `#1F4B3F`→`#6A2A5F`). The skill colours (blue, teal, purple, amber) and the green/red status colours are kept on purpose.
- **Guest flow, all free.** No login, no jetons/TPC, no Pro, no leaderboard and no streak.
- **No guide.** The tooltip guide is removed from every screen (`guide.js` and `guide-data.js` deleted).
- **Assets.** `pro-2d.png` and `tpc-coin.png` are deleted; no screen used them any more.

The original folder is not modified.

## Contents
| Path | What |
|---|---|
| `screens/*.dc.html` | 11 app screens: Onboarding, Home, Speaking, Writing, Result (TestReview), Listening, Reading, History, Mock Test, Mock test detail, Detailed analysis |
| `screens/assets/` | Logo files, plus the question photos the screens use |
| `screens/support.js` | Standalone runtime, copied from the original design folder |
| `screens/*.js`, `screens/icons/` | Shared helpers: icons, demo mode, mock session |
| `logo/` | Final logo files: SVG light, dark and icon, plus the logo board `Logo.dc.html` |

## Flow
1. Onboarding: the splash, then the Welcome screen, then "Start practising".
2. Home.
3. A test.
4. The result.
5. Detailed analysis.

The bottom nav has 3 tabs: **Home · Mock Test · History**. History keeps results on this device.

Links to screens that are not in this set (PracticeConfig, Collection, Shop, Profile and others) go to the nearest screen that is:
- PracticeConfig goes to the test engine for that skill.
- AnswerKey goes to TestReview.
- History's "Review answers" opens TestReview on its answer review: a practice set opens the practice-set view, a finished mock opens the scored view. The view is handed over in `sessionStorage` (`testReview.open`), because the canvas follows plain links only.
  - The review shows the card it came from: `SESSIONS` in `TestReview.dc.html` holds each History card's header, totals and per-skill levels (mock tests #2, #3, #4 and the "Visa notice" practice set, which has its own 8 sample questions).
  - History's mock tests are TEF Canada (they were TCF Canada). The result screen only has TEF Writing and Speaking samples (2 tâches; TCF has 3), so the cards moved to TEF rather than the review inventing TCF content. Mock totals use the TEF counts: 40 Listening + 40 Reading.
- Everything else goes to Home.

## Open it
The screens need a local web server. Opening them with `file://` blocks the icon module.

```bash
cd "design/prepa-contest-final/screens" && python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/Onboarding.dc.html`. Press Cmd/Ctrl+Shift+D for demo mode, which shows a full-screen phone.

## Differences from the original files
- **Images.** `DetailedAnalysis` and `ListeningTest` show their photos with `<img>` tags that have fixed paths. The originals used a CSS `url()` built in JS, and the design canvas does not load that.
- **Icons.** `fig-icon.js` no longer paints icons into the `<x-dc>` template. In a browser, the runtime reads that template as markup. If icons had already been painted into it, React later failed with "removeChild … not a child of this node". The original design has the same failure; it happens on some page loads.
- **Demo mode.** `demo-mode.js` now uses CSS only (a stylesheet keyed on `<html data-tef-demo>` and a `--tef-demo-scale` variable). The original wrote inline styles onto the phone frame. The design canvas records those as edits and puts them back, so after demo mode the frame stayed shifted up and to the left.
- **Sample data, NCLC first.** Every skill score reads "NCLC n" with the CEFR level and "Estimation". The usable level is the weakest skill. A practice set shows a count of correct answers only, with no estimate. Speaking and Writing criteria use the official criterion names and show CEFR levels, with no points and no invented weights. There is no TCF /699, no /20, no /450 and no skill shown as a percentage.
  - CEFR→NCLC used in the samples: A2→4, B1→5, B1+→6, B2→8, C1→9.
  - Kept on purpose: names of fictional people inside French exam passages (Sophie, Marie, Thomas), the percentages inside a Reading chart (exam content), and counts such as "69 / 90" correct.
  - The leaderboard sample names are removed.
