import { parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { format } from "date-fns";

import type { TribeEvent } from "$lib/types";
import { getEventType, getEventTypeLabel } from "$lib/utils/event-presentation";
import { stripHtmlToPlainText } from "$lib/api/normalizers";

import {
	DEFAULT_ROBOTS,
	mobileCanonical,
	type SeoMetadata,
} from "./metadata";

type EventJsonLd = Record<string, unknown>;

function getEventImageUrl(event: TribeEvent): string | undefined {
	if (!event.image) return undefined;
	if (typeof event.image === "string") return event.image;
	return event.image.url ?? event.image.sizes?.medium_large?.url;
}

function formatEventTitleDate(startDate: Date): string {
	return format(startDate, "d. MMMM yyyy", { locale: de });
}

function formatTimeRange(event: TribeEvent, startDate: Date, endDate: Date): string {
	if (event.all_day) return "ganztägig";
	const start = format(startDate, "HH:mm");
	const end = format(endDate, "HH:mm");
	return `${start}–${end}`;
}

export function isEventExpired(event: TribeEvent, now = new Date()): boolean {
	const endValue = event.utc_end_date ?? event.end_date;
	if (!endValue) return false;

	const normalized = endValue.includes("T")
		? endValue
		: endValue.replace(" ", "T");
	const end = parseISO(event.utc_end_date ? `${normalized}Z` : normalized);

	if (Number.isNaN(end.getTime())) return false;
	return end.getTime() < now.getTime();
}

function schemaTypeForEvent(event: TribeEvent): string | undefined {
	const type = getEventType(event);
	if (type === "milonga" || type === "practica") return "DanceEvent";
	if (type === "workshop" || type === "kurs") return "EducationEvent";
	return undefined;
}

function overlayEventJsonLd(
	jsonLd: EventJsonLd,
	mobileUrl: string,
	event: TribeEvent,
): EventJsonLd {
	const overlay: EventJsonLd = structuredClone(jsonLd);
	overlay.url = mobileUrl;

	if (typeof overlay["@id"] === "string" && overlay["@id"].startsWith("http")) {
		overlay["@id"] = mobileUrl;
	}

	const schemaType = schemaTypeForEvent(event);
	if (schemaType && overlay["@type"] === "Event") {
		overlay["@type"] = schemaType;
	}

	return overlay;
}

export function buildEventDescription(event: TribeEvent): string {
	const startDate = parseISO(event.start_date);
	const endDate = parseISO(event.end_date);
	const parts: string[] = [];

	const typeLabel = getEventTypeLabel(event);
	if (typeLabel) parts.push(typeLabel);

	parts.push(formatEventTitleDate(startDate));
	parts.push(formatTimeRange(event, startDate, endDate));

	if (event.venue?.venue) {
		const location = [event.venue.venue, event.venue.city].filter(Boolean).join(", ");
		if (location) parts.push(location);
	}

	const organizer = event.organizer?.[0]?.organizer;
	if (organizer) parts.push(organizer);

	const excerpt = stripHtmlToPlainText(event.excerpt || event.description || "");
	if (excerpt) {
		const trimmed = excerpt.length > 120 ? `${excerpt.slice(0, 117)}…` : excerpt;
		return `${parts.join(" · ")}. ${trimmed}`;
	}

	return parts.join(" · ");
}

export function mapEventSeo(event: TribeEvent, now = new Date()): SeoMetadata {
	const startDate = parseISO(event.start_date);
	const canonical = mobileCanonical(`/event/${event.id}`);
	const expired = isEventExpired(event, now);

	const title = `${event.title} – ${formatEventTitleDate(startDate)} | Rhein-Neckar-Tango`;
	const description = buildEventDescription(event);
	const image = getEventImageUrl(event);

	let jsonLd: EventJsonLd | undefined;
	if (event.json_ld && typeof event.json_ld === "object") {
		jsonLd = overlayEventJsonLd(
			event.json_ld as EventJsonLd,
			canonical,
			event,
		);
	}

	return {
		title,
		description,
		canonical,
		robots: expired ? "noindex, follow" : DEFAULT_ROBOTS,
		image,
		jsonLd,
	};
}
