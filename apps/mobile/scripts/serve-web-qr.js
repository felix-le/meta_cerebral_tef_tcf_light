const { spawn } = require("node:child_process");
const { networkInterfaces } = require("node:os");

function getLanAddress() {
    const interfaces = networkInterfaces();

    for (const addresses of Object.values(interfaces)) {
        for (const address of addresses ?? []) {
            if (address.family === "IPv4" && !address.internal) {
                return address.address;
            }
        }
    }

    throw new Error("Could not find a LAN IPv4 address.");
}

const host = getLanAddress();
const webUrl = `http://${host}:8080`;

console.log(`\nWeb URL: ${webUrl}\n`);

const qr = spawn("npx", ["--yes", "qrcode", "--small", webUrl], {
    stdio: "inherit",
});

qr.on("error", (error) => {
    console.error(`Could not generate the web QR code: ${error.message}`);
    process.exitCode = 1;
});

const server = spawn("python", ["-m", "http.server", "8080", "--directory", "dist", "--bind", "0.0.0.0"], {
    stdio: "inherit",
});

server.on("error", (error) => {
    console.error(`Could not start the web server: ${error.message}`);
    process.exitCode = 1;
});

function stop() {
    server.kill();
    qr.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
