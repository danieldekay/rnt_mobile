#!/usr/bin/env node
import { randomUUID } from "node:crypto";

const targets = {
    origin: {
        baseUrl: process.env.RNT_SMOKE_ORIGIN_URL ?? "https://www.rhein-neckar-tango.de",
        eventsPath: "/wp-json/tribe/events/v1/events",
    },
    mobile: {
        baseUrl: process.env.RNT_SMOKE_MOBILE_URL ?? "https://mobile.rhein-neckar-tango.de",
        eventsPath: "/api/events",
    },
};

const mode = process.argv[2];
if (!Object.hasOwn(targets, mode)) {
    console.error("Usage: node scripts/smoke-deploy.mjs origin|mobile");
    process.exit(2);
}

const { baseUrl, eventsPath } = targets[mode];
const nonce = randomUUID();

async function get(url) {
    const response = await fetch(url, {
        headers: { "cache-control": "no-cache" },
        signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
        throw new Error(`${url.pathname}: HTTP ${response.status}`);
    }
    return response;
}

async function getJson(url) {
    const response = await get(url);
    if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(`${url.pathname}: expected JSON`);
    }
    return response.json();
}

try {
    const base = new URL(baseUrl);

    if (mode === "mobile") {
        const page = new URL("/", base);
        page.searchParams.set("_rnt_smoke", nonce);
        const response = await get(page);
        if (!response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("/: expected HTML");
        }
    }

    const listUrl = new URL(eventsPath, base);
    listUrl.searchParams.set("per_page", "1");
    listUrl.searchParams.set("_rnt_smoke", nonce);
    const list = await getJson(listUrl);
    const event = list?.events?.[0];
    if (!Number.isSafeInteger(event?.id) || event.id <= 0) {
        throw new Error(`${eventsPath}: no events with a valid ID`);
    }

    const detailUrl = new URL(`${eventsPath}/${event.id}`, base);
    detailUrl.searchParams.set("_rnt_smoke", nonce);
    const detail = await getJson(detailUrl);
    if (detail?.id !== event.id) {
        throw new Error(`${detailUrl.pathname}: event ID mismatch`);
    }

    console.log(`smoke ${mode}: event ${event.id} OK`);
} catch (error) {
    console.error(`smoke ${mode}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
}
