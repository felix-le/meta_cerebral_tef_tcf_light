const { spawn } = require("node:child_process");

const connectionMode = process.argv.includes("--tunnel") ? "--tunnel" : "--lan";
const expo = spawn("npx", ["expo", "start", "--web", connectionMode], {
    env: { ...process.env, EXPO_NO_QR_CODE: "1" },
    stdio: ["inherit", "pipe", "inherit"],
});

let output = "";
let qrShown = false;

expo.stdout.on("data", (chunk) => {
    output += chunk.toString();
    const match = output.match(/(?:Web:|Waiting on)\s+(https?:\/\/\S+)/);

    if (!match || qrShown) {
        return;
    }

    qrShown = true;
    const webUrl = match[1];
    console.log(`\nWeb URL: ${webUrl}\n`);

    const qr = spawn("npx", ["--yes", "qrcode", "--small", webUrl], {
        stdio: "inherit",
    });

    qr.on("error", (error) => {
        console.error(`Could not generate the web QR code: ${error.message}`);
    });
});

expo.on("close", (code) => {
    process.exitCode = code ?? 1;
});
