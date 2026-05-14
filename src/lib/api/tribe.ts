/**
 * Re-export layer for the Tribe API module.
 * All public exports are re-delegated to the split modules below.
 */

// --- Normalizers (internal) ---
export {
	decodeHtmlEntities,
	normalizeText,
	normalizeHtml,
	stripHtmlToPlainText,
	escapeHtmlAttribute,
	replaceObfuscatedEmailMarkup,
	normalizeEventImage,
	normalizeEuroAmount,
	normalizeCoordinate,
	normalizeWebsiteUrl,
	normalizeEvent,
} from "./normalizers";

// --- Events ---
export {
	fetchEvents,
	fetchAllEvents,
	fetchEventById,
	fetchOrganizerEvents,
	formatDate,
	getDateRange,
	type EventDateRange,
} from "./events";

// --- Venues ---
export {
	normalizeVenue,
	fetchVenues,
	fetchEnhancedVenues,
} from "./venues";

// --- Organizers ---
export {
	normalizeOrganizer,
	fetchOrganizers,
	fetchEnhancedOrganizers,
} from "./organizers";

// --- DJs ---
export {
	extractDjFromDescription,
	extractWorkshopFromDescription,
	fetchDjCptList,
	fetchDjCptBySlug,
} from "./djs";

// --- Formatting ---
export { formatEventCost } from "./events";

// --- Error class ---
export class EventFetchError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "EventFetchError";
	}
}

// --- Re-export error-handling utilities (used by tests) ---
export {
	fetchEnhancedOrganizersWithErrorHandling,
	fetchEnhancedVenuesWithErrorHandling,
} from "../utils/error-handling";
