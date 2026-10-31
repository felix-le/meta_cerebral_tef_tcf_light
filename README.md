# Prépa TEF TCF — Contest Mock

A lightweight Expo mobile app (iOS + Android) running a shortened **TEF Canada** mock test in
one sitting: **Listening** (Compréhension orale), **Reading** (Compréhension écrite),
**Writing** section B (Expression écrite) and **Speaking** section B (Expression orale).

Built for the **Meta Global AI Developer Hackathon** (Cerebral Valley).

This is a standalone contest build — no accounts, no payments, no admin tooling. Scoring
content is TEF Canada only; AI scoring lands in a later stage (writing/speaking results show
a documented stub until then).

---

## What it does

### Speaking

- Practice prompts modelled on the official speaking tasks.
- Record your answer on the phone.
- AI feedback on fluency, vocabulary, grammar and structure.

### Listening & Reading

- Shortened working sections with real TTS audio (listening) and free navigation (reading).
- A clear in-app note says the full 40-question versions arrive after launch.

### Writing

- Section B only: defend a point of view, 200 words minimum.
- Write your answer in the app with an accent keyboard and live word count.

### Speaking

- Section B only: present and convince, stub take with live examiner cues.
- No real recording in Stage 0; no second take, like the exam.

App UI is English; exam content is French.

---

## Built 100% with Meta AI

Every line of this app was written with **Muse Code**, powered by **Meta
Muse Spark** models — and the app itself is scored by those same Meta
models (`muse-spark`) through the Meta Model API. No other AI provider is
involved anywhere in the codebase or the grading.

The **Muse** agent worked as the development assistant throughout:
reviewing code, breaking work into staged plans, keeping each change inside
an approved scope, tracking tasks and re-verifying (`tsc` + `expo export` +
on-device checks) before handing every step back for human review.

---

## Tech stack

| Layer       | Choice                                |
| ----------- | ------------------------------------- |
| Mobile      | Expo (TypeScript, expo-router)        |
| AI feedback | Meta AI models via the Meta Model API |

---

## Repository layout

```
meta_cerebral_valley_tef_tcf/
├── README.md            this file
└── apps/
    └── mobile/          Expo app (4-skill mock)
```

---

## Getting started

Prerequisites: Node LTS, Xcode + iOS Simulator and/or Android Studio + emulator.

```bash
cd apps/mobile
npm install
npx expo start
```

---

## Status

Hackathon build — work in progress.

---

## Legal

Not affiliated with CCI Paris Île-de-France or France Éducation International.
"TEF" and "TCF" are trademarks of their respective owners.
