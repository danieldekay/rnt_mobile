import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { after, test } from "node:test";

let failure = "";

const server = createServer((request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;

    if (path === "/") {
        response.setHeader("content-type", "text/html");
        response.end("<html><title>RNT Kalender</title></html>");
        return;
    }

    if (path.endsWith("/events")) {
        if (failure === "upstream") {
            response.writeHead(502).end("Bad Gateway");
            return;
        }
        const events = failure === "empty"
            ? []
            : [{ id: 42, title: "Milonga" }];
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ events }));
        return;
    }

    if (path.endsWith("/events/42")) {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ id: 42, title: "Milonga" }));
        return;
    }

    response.writeHead(404).end("Not Found");
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
after(() => server.close());

const baseUrl = `http://127.0.0.1:${server.address().port}`;

function runSmoke(mode, simulatedFailure = "") {
    failure = simulatedFailure;
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ["scripts/smoke-deploy.mjs", mode], {
            cwd: new URL("..", import.meta.url),
            env: {
                ...process.env,
                RNT_SMOKE_ORIGIN_URL: baseUrl,
                RNT_SMOKE_MOBILE_URL: baseUrl,
            },
        });
        let output = "";
        child.stdout.on("data", (chunk) => { output += chunk; });
        child.stderr.on("data", (chunk) => { output += chunk; });
        child.on("error", reject);
        child.on("close", (code) => resolve({ code, output }));
    });
}

test("origin smoke accepts an event list and matching detail", async () => {
    const result = await runSmoke("origin");
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /origin.*event 42/);
});

test("origin smoke rejects an upstream 502", async () => {
    const result = await runSmoke("origin", "upstream");
    assert.notEqual(result.code, 0);
    assert.match(result.output, /502/);
});

test("mobile smoke rejects an empty event list", async () => {
    const result = await runSmoke("mobile", "empty");
    assert.notEqual(result.code, 0);
    assert.match(result.output, /no events/i);
});

test("mobile smoke checks the page, list, and detail", async () => {
    const result = await runSmoke("mobile");
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /mobile.*event 42/);
});
