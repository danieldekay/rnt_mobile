import { describe, expect, it } from 'vitest';
import { getUpdateCheckErrorMessage, isBenignUpdateCheckMiss } from './update-check-errors';

describe('PWA update check error helpers', () => {
	it('extracts messages from Error instances and strings', () => {
		expect(getUpdateCheckErrorMessage(new Error('network unavailable'))).toBe('network unavailable');
		expect(getUpdateCheckErrorMessage('plain failure')).toBe('plain failure');
		expect(getUpdateCheckErrorMessage(null)).toBe('');
	});

	it('treats SvelteKit newestWorker null as a benign no-update result', () => {
		expect(isBenignUpdateCheckMiss(new Error('newestWorker is null'))).toBe(true);
		expect(isBenignUpdateCheckMiss('newestWorker is null')).toBe(true);
	});

	it('does not hide other update check failures', () => {
		expect(isBenignUpdateCheckMiss(new Error('Failed to fetch'))).toBe(false);
		expect(isBenignUpdateCheckMiss('permission denied')).toBe(false);
	});
});
