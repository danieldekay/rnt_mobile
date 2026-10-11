import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const headers = fs.readFileSync(path.resolve('static/_headers'), 'utf8');

describe('static update headers', () => {
	it('marks root and HTML entry documents as no-store', () => {
		expect(headers).toContain('/\n  Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
		expect(headers).toContain('/*.html\n  Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
	});

	it('marks service worker and SvelteKit version metadata as no-store', () => {
		expect(headers).toContain('/service-worker.js\n  Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
		expect(headers).toContain('/_app/version.json\n  Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
	});
});
