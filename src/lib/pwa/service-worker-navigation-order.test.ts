import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/service-worker.ts'), 'utf8');

describe('service worker navigation ordering', () => {
	it('handles navigations before app-shell cache-first matches', () => {
		const navigationIndex = source.indexOf('request.mode === "navigate"');
		const appShellIndex = source.indexOf('ASSETS.includes(request.url)');

		expect(navigationIndex).toBeGreaterThan(-1);
		expect(appShellIndex).toBeGreaterThan(-1);
		expect(navigationIndex).toBeLessThan(appShellIndex);
	});

	it('does not explicitly precache the root document as an app-shell asset', () => {
		expect(source).not.toContain('\n\t"/",');
		expect(source).toContain('filter((path) => path !== "/")');
	});
});
