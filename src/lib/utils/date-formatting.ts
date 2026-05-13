import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Ensures we have a valid Date object from either a string (ISO) or Date object.
 */
function toDate(value: string | Date | null | undefined): Date {
	if (!value) return new Date(NaN);
	return typeof value === 'string' ? parseISO(value) : value;
}

/**
 * Formats a date to a full German string.
 * Example: "9. Mai 2026"
 */
export function formatDate(value: string | Date | null | undefined): string {
	const date = toDate(value);
	if (!isValid(date)) return '';
	return format(date, 'd. MMMM yyyy', { locale: de });
}

/**
 * Formats a date to a short German string.
 * Example: "9. Mai"
 */
export function formatShortDate(value: string | Date | null | undefined): string {
	const date = toDate(value);
	if (!isValid(date)) return '';
	return format(date, 'd. MMM', { locale: de });
}

/**
 * Formats a date including the abbreviated weekday.
 * Example: "Sa, 9. Mai"
 */
export function formatDayAndMonth(value: string | Date | null | undefined): string {
	const date = toDate(value);
	if (!isValid(date)) return '';
	return format(date, 'EEE, d. MMM', { locale: de });
}

/**
 * Formats a date to YYYY-MM-DD for API requests.
 */
export function formatApiDate(value: string | Date | null | undefined): string {
	const date = toDate(value);
	if (!isValid(date)) return '';
	return format(date, 'yyyy-MM-dd');
}

/**
 * Formats the time part of a date in 24h format.
 * Example: "19:00"
 */
export function formatTime(value: string | Date | null | undefined): string {
	const date = toDate(value);
	if (!isValid(date)) return '';
	return format(date, 'HH:mm');
}

/**
 * Formats a time range between two dates using an en-dash.
 * Example: "19:00 – 22:00"
 */
export function formatTimeRange(
	start: string | Date | null | undefined,
	end: string | Date | null | undefined
): string {
	const startTime = formatTime(start);
	const endTime = formatTime(end);

	if (!startTime) return '';
	return endTime && endTime !== startTime ? `${startTime} – ${endTime}` : startTime;
}
