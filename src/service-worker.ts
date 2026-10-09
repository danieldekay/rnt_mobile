/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from "$service-worker";
import { isCacheablePublicApiRequest } from "$lib/pwa/service-worker-policy";

// Create a unique cache name for this deployment
const CACHE_NAME = `rnt-cache-${version}`;

const ASSETS = [
	...build,
	...prerendered,
	// Core app-shell resources — cache-first strategy
	"/",
	"/offline",
	"/manifest.json",
	"/favicon.ico",
	"/rnt-logo.png",
	"/apple-touch-icon.png",
	"/icon-192.png",
	"/icon-512.png",
	"/icon-192-maskable.png",
	"/icon-512-maskable.png",
].map((path) => new URL(path, location.origin).href);

// Install: precache app-shell assets
self.addEventListener("install", (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
	);
	// Skip waiting to activate immediately
	self.skipWaiting();
});

// Activate: clean old caches and take control of open clients
self.addEventListener("activate", (event: ExtendableEvent) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(
				names
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			);
			await self.clients.claim();
		})(),
	);
});

// Fetch: cache-first for app-shell, network-first for explicitly public GET data.
self.addEventListener("fetch", (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never intercept cross-origin requests (OSM tiles, Matomo, fonts, etc.).
	if (url.origin !== self.location.origin) {
		return;
	}

	// Mutating, auth, newsletter, and other sensitive API requests remain network-only.
	// This also prevents Cache API writes for POST/PATCH/DELETE requests.
	if (url.pathname.startsWith("/api/")) {
		if (isCacheablePublicApiRequest(request.method, url.pathname)) {
			event.respondWith(networkFirst(request));
		}
		return;
	}

	// App-shell assets: cache-first
	if (ASSETS.includes(request.url)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// Dynamic resources (images, fonts): cache network response
	if (
		url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|woff2?)$/)
	) {
		event.respondWith(cacheNetwork(request));
		return;
	}

	// Navigation requests use an explicit three-step fallback:
	// network -> cached navigation -> dedicated offline page.
	if (request.mode === "navigate") {
		event.respondWith(navigationNetworkFirst(request));
	}
});

// Cache-first strategy: serve from cache, fall back to network
async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	return fetch(request);
}

// Network-first strategy: try network, fall back to the exact cached request.
async function networkFirst(request: Request): Promise<Response> {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok && request.method === "GET") {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		const cached = await caches.match(request);
		return cached || Response.error();
	}
}

async function navigationNetworkFirst(request: Request): Promise<Response> {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		const cachedNavigation = await caches.match(request);
		if (cachedNavigation) return cachedNavigation;

		const offline = await caches.match("/offline");
		return (
			offline ??
			new Response("Offline", {
				status: 503,
				headers: { "content-type": "text/plain; charset=utf-8" },
			})
		);
	}
}

// Cache network response (fire-and-forget caching)
async function cacheNetwork(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok && request.method === "GET") {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		return cached || Response.error();
	}
}
