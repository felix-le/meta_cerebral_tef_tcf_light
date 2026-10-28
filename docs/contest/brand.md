# Contest MVP brand — Prépa TEF TCF (FINAL)

**Final, approved by the owner on 2026-10-27:** the name, the logo, the colours and the screen design are locked.

> Contest build only (Meta Global AI Developer Hackathon, see `HANDOVER-CLAUDE.md`). Does not change the
> Mock Prep brand or the original repo. Design canvas: https://claude.ai/artifact/922UT7mtBxSJQHHz1RKDVq

## Name
**Prépa TEF TCF** (chosen 2026-10-26, `HANDOVER-CLAUDE.md` §3.4).
Preliminary check on 2026-10-27: `docs/contest/name-check.md` (not legal advice).
- No app or product with the exact name was found. Close names exist: "TCF TEF Prep", "PrepMyTEF / PrepMyTCF".
- **TEF is a registered Canadian trademark of CCI Paris (CIPO 0877460, classes incl. 41).**
- `prepateftcf.com` / `.ca` / `.fr` looked free; nothing registered.
- USPTO, EUIPO and Google Play: not checked.

History: the earlier name "Voix & Plume" (quill logo) was dropped on 2026-10-26. So were concepts A/B/C on the canvas. Do not use them.

## Logo (final, approved 2026-10-27)
Drawn by the owner, redrawn as vectors in `docs/contest/logo/`:
- `prepa-logo.svg`: wordmark "Prépa" + "TEF · TCF", on light grounds.
- `prepa-logo-dark.svg`: white letters on logo plum, gold kept.
- `prepa-icon.svg`: app icon 1024×1024, the P with a gold dot.

Mark: the P is a speech bubble whose tail forms the stem.
Logo colours:
- plum `#6A2A5F`
- gold `#F9BD48`, used for the acute accent and the dot between TEF and TCF

Canvas board: "Prépa TEF TCF · final logo".

## Colours
The app follows the logo colours (owner, 2026-10-27).

| Token | Hex | Use |
|---|---|---|
| plum | `#6A2A5F` | brand: splash, Speaking tile, primary buttons. White on it 10:1 |
| gold | `#F9BD48` | accent: Writing tile, highlights, the logo accent. **Dark text only** (ink on it 9.3:1; white is 1.7:1, never) |
| ink | `#2E1A3B` | body text, titles |
| muted | `#5E4E69` | secondary text on white / mist |
| lilac | `#EFE3EC` | chips, rings, selected states (tint of plum) |
| mist | `#F8F3F7` | light screen ground |
| paper | `#FFFFFF` | cards |

## Type
Only the logo has its own lettering (owner, 2026-10-27). The app keeps the original design's fonts:
- Inter
- Instrument Serif italic, where the original uses it

Bricolage Grotesque is not used.

## Screens
The contest app reuses the original design (`design/TEF TCF Prep design setup/`). Only the branding changes: logo, logo colours and name. There is no mascot: Mimi is dropped for the contest build.

**Flow.** Guest, everything free:
1. Splash
2. Welcome ("Start practising", no account)
3. Home (Speaking B and Writing B first, four skill cards)
4. A test
5. The result

**Removed:** login, TPC/jetons, Pro, leaderboard, streak, daily bonus.

**Bottom nav.** Three tabs: Home · Mock Test · History.
- No Profile tab, because guests have no account.
- History replaces Collection.

**History.** The original TestHistory screen for a guest. Results are kept on this device. No placement prompt, no Pro state.

**Mock Test tab.** The original MockTest → MockTestDetail screens. Every session is free: cost chips read "Free", no session is Pro-only, and the TPC note is gone.

**Detailed Analysis.** Opened from the result, always open and free.

**Screens not on the canvas** (PracticeConfig, Collection, Shop, Profile, AnswerKey) are skipped. Their links go to the matching test, to the result, or to Home.

**Final export (approved 2026-10-27):** `design/prepa-contest-final/`.
- Contents: the 11 screens, the assets, the logo and the standalone runtime.
- Its README covers how to open it and how it differs from the original files.
