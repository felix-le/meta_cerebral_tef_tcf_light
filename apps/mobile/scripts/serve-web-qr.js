const { createReadStream, existsSync, statSync } = require("node:fs");
const { createServer } = require("node:http");
const { networkInterfaces } = require("node:os");
const { extname, join, normalize } = require("node:path");
const { spawn } = require("node:child_process");

function getLanAddress() {
    const interfaces = networkInterfaces();
    const preferredNames = /^(en0|en1|wi-?fi|ethernet|wlan|eth)/i;
    const candidates = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
        for (const address of addresses ?? []) {
            const family = address.family === "IPv4" || address.family === 4;
            const isPrivate =
                address.address.startsWith("10.") ||
                address.address.startsWith("192.168.") ||
                /^172\.(1[6-9]|2\d|3[01])\./.test(address.address);
            if (family && !address.internal && isPrivate) {
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

function isLanAddress(address) {
    return (
        address.startsWith("10.") ||
        address.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(address)
    );
}

const firstPort = Number(process.env.WEB_PORT ?? 8787);
if (!Number.isInteger(firstPort) || firstPort < 1 || firstPort > 65535) {
    throw new Error("WEB_PORT must be a valid TCP port.");
}

const configuredHost = process.env.WEB_HOST;
const host = configuredHost && isLanAddress(configuredHost) ? configuredHost : getLanAddress();
const root = join(process.cwd(), "dist");
const mimeTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".webp": "image/webp",
};
const server = createServer((request, response) => {
    const requestPath = decodeURIComponent(request.url?.split("?")[0] ?? "/");
    const relativePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, relativePath);

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        filePath = join(root, "index.html");
    }

    if (!existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
});

function startServer(port) {
    return new Promise((resolve, reject) => {
        const handleError = (error) => {
            server.removeListener("listening", handleListening);
            if (error.code === "EADDRINUSE" && port < 65535) {
                resolve(startServer(port + 1));
            } else {
                reject(error);
            }
        };
        const handleListening = () => {
            server.removeListener("error", handleError);
            resolve(port);
        };

        server.once("error", handleError);
        server.once("listening", handleListening);
        server.listen(port, "0.0.0.0");
    });
}

let qr;
function stop() {
    server.close();
    qr?.kill();
}

startServer(firstPort)
    .then((port) => {
        const webUrl = `http://${host}:${port}`;
        console.log(`\nWeb URL: ${webUrl}`);
        console.log(`Serving web app at ${webUrl}\n`);

        const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
        qr = spawn(npxCommand, ["--yes", "qrcode", "--small", webUrl], {
            stdio: "inherit",
        });

        qr.on("error", (error) => {
            console.error(`Could not generate the web QR code: ${error.message}`);
            process.exitCode = 1;
        });
    })
    .catch((error) => {
        console.error(`Could not start the web server: ${error.message}`);
        process.exitCode = 1;
    });

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
