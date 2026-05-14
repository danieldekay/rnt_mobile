/**
 * Normalization helpers for Tribe/WordPress data.
 * HTML decoding, text sanitization, image/URL normalization.
 */

import he from "he";
import type { EventImage, TribeEvent } from "$lib/types";

// --- HTML / Text normalization ---

export function decodeHtmlEntities(value: string): string {
	return he.decode(value);
}

export function normalizeText(value: string | null | undefined): string {
	if (!value) return "";

	return decodeHtmlEntities(value)
		.replace(/\u00a0/g, " ")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

export function normalizeHtml(value: string | null | undefined): string {
	if (!value) return "";

	return decodeHtmlEntities(value).replace(/\u00a0/g, " ");
}

export function stripHtmlToPlainText(value: string | null | undefined): string {
	if (!value) return "";

	return normalizeHtml(value)
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{2,}/g, "\n")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

export function escapeHtmlAttribute(value: string): string {
	return he.escape(value).trim();
}

// --- Obfuscated email replacement ---

export function replaceObfuscatedEmailMarkup(
	value: string,
	websiteUrl: string,
): string {
	const safeWebsiteUrl = escapeHtmlAttribute(websiteUrl);

	return value.replace(
		/<span\b[^>]*class=(['"])[^'"]*\bapbct-email-encoder\b[^'"]*\1[^>]*>(?:[\s\S]*?<span\b[^>]*class=(['"])[^'"]*\bapbct-blur\b[^'"]*\2[^>]*>[\s\S]*?<\/span>){1,4}[\s\S]*?<\/span>\s*\.?/gi,
		`(siehe <a href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer">Website für Details</a>)`,
	);
}

// --- Image / amount / URL normalization ---

export function normalizeEventImage(image: EventImage): string | false {
	if (!image) return false;
	if (typeof image === "string") return normalizeText(image) || false;

	return (
		normalizeText(image.sizes?.medium_large?.url) ||
		normalizeText(image.sizes?.medium?.url) ||
		normalizeText(image.url) ||
		normalizeText(image.sizes?.thumbnail?.url) ||
		false
	);
}

export function normalizeEuroAmount(value: string): string {
	if (/^\d+[.]\d{1,2}$/.test(value)) {
		return value.replace(".", ",");
	}

	return value;
}

export function normalizeCoordinate(
	value: number | string | null | undefined,
): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number.parseFloat(value.replace(",", "."));
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

export function normalizeWebsiteUrl(value: string | null | undefined): string {
	const normalized = normalizeText(value);
	if (!normalized) return "";

	if (/^https?:\/\//i.test(normalized)) {
		return normalized;
	}

	if (normalized.startsWith("//")) {
		return `https:${normalized}`;
	}

	return `https://${normalized}`;
}

// --- Entity normalization ---

export function normalizeEvent(event: TribeEvent): TribeEvent {
	const normalizedDescription = normalizeHtml(event.description);
	const description = replaceObfuscatedEmailMarkup(
		normalizedDescription,
		event.url,
	);

	return {
		...event,
		title: normalizeText(event.title),
		description,
		image: normalizeEventImage(event.image),
		cost: normalizeText(event.cost),
		venue: event.venue
			? {
					...event.venue,
					venue: normalizeText(event.venue.venue),
					address: normalizeText(event.venue.address),
					city: normalizeText(event.venue.city),
				}
			: event.venue,
		organizer: event.organizer?.map((organizer) => ({
			...organizer,
			organizer: normalizeText(organizer.organizer),
		})),
		categories: event.categories?.map((category) => ({
			...category,
			name: normalizeText(category.name),
		})),
	};
}
