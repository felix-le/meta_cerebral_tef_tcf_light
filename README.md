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

## Run the web version

### Deployed site

The production web app is hosted on Vercel and does not depend on this
computer being turned on:

**Site:** https://dist-orpin-six-42.vercel.app

**QR code for slides:** [apps/mobile/web-qr.png](apps/mobile/web-qr.png)

The QR code above points to the production site. It can be scanned from any
network and supports multiple users at the same time. User history is stored
locally in each browser/device, so users have separate sessions. The computer
only needs to be running when deploying a new version.

### Run locally

```bash
cd apps/mobile
npm install
npm run web:static:qr
```

This single command builds the web version, starts the server, and immediately
displays the QR code in the terminal. Scan it with a phone on the same Wi-Fi.
The QR contains the computer's Wi-Fi/Ethernet IP, not `localhost`.
The server uses Node.js, so it works on macOS, Windows, and Linux without
installing Python.
Press `Ctrl+C` to stop the server.

The static QR server starts at port `8787`. If that port is already in use, it
automatically tries `8788`, `8789`, and so on, then puts the selected port in
the QR URL. It never uses `localhost`; if `localhost` appears, the other
computer is running an old copy of the repository. Pull the latest code and
run `npm install` again.

For a local team demo, run this command on **one computer only**. All phones
scan the same QR code; the server supports multiple users at the same time.
Do not run it separately on each computer. If phones cannot connect, disable Wi-Fi
client isolation and allow Node.js through the host computer's firewall. A
different port will not fix a blocked network.

If the QR works from one Mac but not another, compare the network first:

1. Connect the phone to the **same Wi-Fi network** as the Mac running the
   command. Turn off cellular data and any VPN on the phone.
2. On the Mac, open the printed `Web URL` in its own browser. Then open that
   same URL on the phone. If the Mac works but the phone does not, macOS
   **System Settings > Network > Firewall** is blocking incoming Node
   connections, or the Wi-Fi has client isolation enabled.
3. If the phone and Mac cannot share a Wi-Fi network, use the web tunnel
   command instead:

   ```bash
   npm run web:qr:tunnel
   ```

   This creates a web QR that works across different networks, but it can be
   slower than the local-LAN QR.

---

## Status

Hackathon build — work in progress.

---

## Legal

Not affiliated with CCI Paris Île-de-France or France Éducation International.
"TEF" and "TCF" are trademarks of their respective owners.

No Expo Go, no login, nothing to install — anyone opens it in a browser.
Prerequisites: Node LTS only (no Xcode / Android Studio needed).

```bash
cd apps/mobile
npm install
npm run web:qr
```
