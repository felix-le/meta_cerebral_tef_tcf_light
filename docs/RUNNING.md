# Running Prépa TEF TCF

How to run the app locally, on the web, and share it with a QR code.

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

**QR code for slides:** [../apps/mobile/web-qr.png](../apps/mobile/web-qr.png)

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
