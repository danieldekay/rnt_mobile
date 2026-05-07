import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizeText, escapeHtml } from "./html";

describe("sanitizeHtml", () => {
	it("should sanitize raw HTML and return a safe string", () => {
		const result = sanitizeHtml('<script>alert("xss")</script><p>Hello</p>');
		expect(result).not.toContain("<script>");
		expect(result).toContain("<p>Hello</p>");
		expect(result).toBeTruthy();
	});

	it("should return a non-empty string for simple text content", () => {
		const result = sanitizeHtml("Hello World");
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});
});

describe("sanitizeText", () => {
	it("should escape all HTML entities", () => {
		const result = sanitizeText("<b>Bold</b>");
		expect(result).toBe("Bold");
	});
});

describe("escapeHtml", () => {
	it("should escape special characters", () => {
		const result = escapeHtml('<div class="x">');
		expect(result).toBe("&lt;div class=&quot;x&quot;&gt;");
	});
});
