/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from "$service-worker";

// Create a unique cache name for this deployment
const CACHE_NAME = `rnt-cache-${version}`;

const ASSETS = [
	...build,
	...prerendered,
	// Core app-shell resources — precached for offline fallback
	"/",
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

// Fetch current navigation HTML; cache static assets and use network-first for API/data
self.addEventListener("fetch", (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never intercept cross-origin requests (OSM tiles, Matomo, fonts, etc.).
	// Handling them and returning Response.error() breaks map tiles in the PWA.
	if (url.origin !== self.location.origin) {
		return;
	}

	// API requests: network-first with stale-while-revalidate
	if (url.pathname.startsWith("/api/")) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Refresh navigation HTML after deployments; keep cache as an offline fallback.
	if (request.mode === "navigate") {
		event.respondWith(navigationFirst(request));
		return;
	}

	// Static app-shell assets: cache-first
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
});

// Cache-first strategy: serve from cache, fall back to network
async function cacheFirst(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	return fetch(request);
}

// Network-first strategy: try network, fall back to cache
async function networkFirst(
	request: Request,
	init?: RequestInit,
): Promise<Response> {
	try {
		const networkResponse = await fetch(request, init);
		// Cache successful responses for next time
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		const cached = await caches.match(request);
		return cached || Response.error();
	}
}

async function navigationFirst(request: Request): Promise<Response> {
	const response = await networkFirst(request, { cache: "no-cache" });
	if (response.type !== "error") return response;

	return (await caches.match("/offline")) || response;
}

// Cache network response (fire-and-forget caching)
async function cacheNetwork(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		return cached || Response.error();
	}
}
