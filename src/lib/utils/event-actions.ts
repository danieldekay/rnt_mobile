import { parseISO } from 'date-fns';

import type { TribeEvent } from '$lib/types';

type ShareData = {
	title: string;
	text: string;
	url: string;
};

function toDate(value: string): Date {
	return parseISO(value);
}

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

function formatDateLabel(date: Date, allDay: boolean): string {
	const dateLabel = date.toLocaleDateString('de-DE', {
		weekday: 'short',
		day: 'numeric',
		month: 'short'
	});

	if (allDay) {
		return dateLabel;
	}

	const timeLabel = date.toLocaleTimeString('de-DE', {
		hour: '2-digit',
		minute: '2-digit'
	});

	return `${dateLabel}, ${timeLabel}`;
}

function stripHtml(value: string): string {
	return value
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>/gi, '\n\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+\n/g, '\n')
		.replace(/\n\s+/g, '\n')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\r?\n/g, '\\n')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,');
}

function formatUtcDateTime(date: Date): string {
	return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function formatDateValue(date: Date): string {
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function getLocation(event: TribeEvent): string {
	if (!event.venue) {
		return '';
	}

	return [
		event.venue.venue,
		event.venue.address,
		event.venue.city,
		event.venue.zip,
		event.venue.country
	]
		.filter(Boolean)
		.join(', ');
}

function getDescription(event: TribeEvent): string {
	const description = stripHtml(event.excerpt || event.description || '');
	const lines = [description, `Mehr Infos: ${event.url}`].filter(Boolean);

	return lines.join('\n\n');
}

export function getEventShareData(event: TribeEvent): ShareData {
	const startDate = toDate(event.start_date);
	const parts = [formatDateLabel(startDate, event.all_day), event.venue?.venue].filter(Boolean);

	return {
		title: event.title,
		text: `${event.title} · ${parts.join(' · ')}`,
		url: event.url
	};
}

export function getEventCalendarFileName(event: TribeEvent): string {
	const baseName = (event.slug || `event-${event.id}`).replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-');

	return `${baseName.replace(/^-|-$/g, '') || `event-${event.id}`}.ics`;
}

export function createEventCalendarIcs(event: TribeEvent): string {
	const startDate = toDate(event.start_date);
	const endDate = toDate(event.end_date);
	const dtStamp = formatUtcDateTime(new Date());
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//RNT Kalender//rnt_mobile//DE',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:rnt-mobile-event-${event.id}@rhein-neckar-tango.de`,
		`DTSTAMP:${dtStamp}`,
		`SUMMARY:${escapeIcsText(event.title)}`
	];

	if (event.all_day) {
		const exclusiveEnd = new Date(endDate);
		exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);

		lines.push(`DTSTART;VALUE=DATE:${formatDateValue(startDate)}`);
		lines.push(`DTEND;VALUE=DATE:${formatDateValue(exclusiveEnd)}`);
	} else {
		lines.push(`DTSTART:${formatUtcDateTime(startDate)}`);
		lines.push(`DTEND:${formatUtcDateTime(endDate)}`);
	}

	const location = getLocation(event);
	if (location) {
		lines.push(`LOCATION:${escapeIcsText(location)}`);
	}

	const description = getDescription(event);
	if (description) {
		lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
	}

	lines.push(`URL:${escapeIcsText(event.url)}`);
	lines.push('STATUS:CONFIRMED');
	lines.push('END:VEVENT');
	lines.push('END:VCALENDAR');

	return `${lines.join('\r\n')}\r\n`;
}