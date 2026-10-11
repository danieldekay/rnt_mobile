/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from "$service-worker";
import { isCacheablePublicApiRequest } from "$lib/pwa/service-worker-policy";
import { networkFirstNavigation } from "$lib/pwa/navigation-fallback";

// Create a unique cache name for this deployment
const CACHE_NAME = `rnt-cache-${version}`;
const UPDATE_MESSAGE_TYPE = "RNT_SW_ACTIVATED";

const ASSETS = [
	...build,
	...prerendered,
	// Core app-shell resources — cache-first strategy for non-navigation assets only.
	"/offline",
	"/manifest.json",
	"/favicon.ico",
	"/rnt-logo.png",
	"/apple-touch-icon.png",
	"/icon-192.png",
	"/icon-512.png",
	"/icon-192-maskable.png",
	"/icon-512-maskable.png",
]
	// Never treat the root document as a cache-first asset. Safari/bookmark launches
	// otherwise keep receiving an old cached app shell before update code can run.
	.filter((path) => path !== "/")
	.map((path) => new URL(path, location.origin).href);

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
			const clients = await self.clients.matchAll({ type: "window" });
			for (const client of clients) {
				client.postMessage({ type: UPDATE_MESSAGE_TYPE, version });
			}
		})(),
	);
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
	const type = event.data?.type;
	if (type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

// Fetch: navigation is always network-first. Non-navigation app-shell assets can be
// cache-first; explicitly public GET data is network-first with cache fallback.
self.addEventListener("fetch", (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never intercept cross-origin requests (OSM tiles, Matomo, fonts, etc.).
	if (url.origin !== self.location.origin) {
		return;
	}

	// Never let the Service Worker serve stale update metadata.
	if (url.pathname === "/service-worker.js" || url.pathname === "/_app/version.json") {
		event.respondWith(fetch(request));
		return;
	}

	// Navigation must run before the app-shell cache check. Otherwise a bookmarked
	// root URL like `/` can be served cache-first forever in Safari/PWA contexts.
	if (request.mode === "navigate") {
		event.respondWith(networkFirstNavigation(request, CACHE_NAME));
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

	// App-shell assets: cache-first. Documents are already handled as navigations.
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
