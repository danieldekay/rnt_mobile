import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/svelte";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {
	if (!("matchMedia" in window)) {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	}
});

beforeEach(() => {
	document.body.innerHTML = "";
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});