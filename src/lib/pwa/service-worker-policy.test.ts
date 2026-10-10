import { describe, expect, it } from "vitest";
import { isCacheablePublicApiRequest } from "./service-worker-policy";

describe("Service Worker API cache policy", () => {
    it("allows only public GET data", () => {
        expect(isCacheablePublicApiRequest("GET", "/api/events")).toBe(true);
        expect(isCacheablePublicApiRequest("GET", "/api/events/123")).toBe(true);
        expect(isCacheablePublicApiRequest("GET", "/api/offline-snapshot")).toBe(true);
        expect(isCacheablePublicApiRequest("GET", "/api/entity-overview")).toBe(true);
    });

    it("never caches mutating or sensitive endpoints", () => {
        expect(isCacheablePublicApiRequest("POST", "/api/events")).toBe(false);
        expect(isCacheablePublicApiRequest("POST", "/api/newsletter/subscribe")).toBe(false);
        expect(isCacheablePublicApiRequest("GET", "/api/newsletter/nonce")).toBe(false);
        expect(isCacheablePublicApiRequest("GET", "/api/wp-auth-status")).toBe(false);
    });
});
