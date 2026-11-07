const { spawn } = require("node:child_process");
const { networkInterfaces } = require("node:os");

function getLanAddress() {
    const interfaces = networkInterfaces();
    const preferredNames = /^(en0|en1|wi-?fi|ethernet|wlan|eth)/i;
    const candidates = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
        for (const address of addresses ?? []) {
            if (address.family === "IPv4" && !address.internal) {
                candidates.push({
                    address: address.address,
                    preferred: preferredNames.test(name),
                });
            }
        }
    }

    const candidate = candidates.find(({ preferred }) => preferred) ?? candidates[0];
    if (candidate) {
        return candidate.address;
    }

    throw new Error("Could not find a LAN IPv4 address.");
}

const port = Number(process.env.WEB_PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("WEB_PORT must be a valid TCP port.");
}

const host = process.env.WEB_HOST ?? getLanAddress();
const webUrl = `http://${host}:${port}`;

console.log(`\nWeb URL: ${webUrl}\n`);

const qr = spawn("npx", ["--yes", "qrcode", "--small", webUrl], {
    stdio: "inherit",
});

qr.on("error", (error) => {
    console.error(`Could not generate the web QR code: ${error.message}`);
    process.exitCode = 1;
});

const server = spawn("python", ["-m", "http.server", String(port), "--directory", "dist", "--bind", "0.0.0.0"], {
    stdio: "inherit",
});

server.on("error", (error) => {
    console.error(`Could not start the web server: ${error.message}`);
    process.exitCode = 1;
});

server.on("close", (code) => {
    if (code !== 0) {
        console.error(`Web server stopped. Port ${port} may already be in use.`);
        process.exitCode = code ?? 1;
    }
});

function stop() {
    server.kill();
    qr.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
