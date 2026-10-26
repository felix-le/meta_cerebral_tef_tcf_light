# TEF & TCF Canada — Speaking & Writing Practice (Light)

A lightweight Expo mobile app (iOS + Android) to practise the two productive skills of the
**TEF Canada** and **TCF Canada** French exams: **Speaking** (Expression orale) and
**Writing** (Expression écrite).

Built for the **Meta Global AI Developer Hackathon** (Cerebral Valley).

This is a standalone, light build focused on two skills only. It is not the full mock-exam
platform — no accounts, no payments, no admin tooling, no other exam skills.

---

## What it does

### Speaking

- Practice prompts modelled on the official speaking tasks.
- Record your answer on the phone.
- AI feedback on fluency, vocabulary, grammar and structure.

### Writing

- Practice prompts modelled on the official writing tasks.
- Write your answer in the app.
- AI feedback on structure, vocabulary, grammar and coherence.

Production UI is French.

---

## Tech stack

| Layer | Choice |
|---|---|
| Mobile | Expo (TypeScript, expo-router) |
| AI feedback | Meta AI models via the Meta Model API |

---

## Repository layout

```
meta_cerebral_valley_tef_tcf/
├── README.md            this file
└── apps/
    └── mobile/          Expo app (speaking + writing practice)
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
