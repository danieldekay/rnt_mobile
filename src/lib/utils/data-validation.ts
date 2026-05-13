/**
 * Data validation and sanitization utilities for enhanced organizer and venue data
 */

import type { EnhancedOrganizer, EnhancedVenue } from "$lib/types";

// URL validation patterns
const URL_PATTERN = /^https?:\/\/.+(\.[a-z]{2,})+$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s\-()]+$/;
const COORDINATE_PATTERN = /^-?\d+(\.\d+)?$/;

// Common social media URL patterns
const SOCIAL_MEDIA_PATTERNS = {
	facebook: /^https:\/\/(www\.)?facebook\.com\/.+/i,
	instagram: /^https:\/\/(www\.)?instagram\.com\/.+/i,
	twitter: /^https:\/\/(www\.)?twitter\.com\/.+/i,
	youtube: /^https:\/\/(www\.)?youtube\.com\/.+/i,
	spotify: /^https:\/\/(www\.)?spotify\.com\/.+/i,
	soundcloud: /^https:\/\/(www\.)?soundcloud\.com\/.+/i,
};

// Organization type validation
const VALID_ORGANIZATION_TYPES = [
	"verein",
	"privat",
	"geschaeft",
	"kuenstler",
	"other",
];

// Validation severity levels
export type ValidationSeverity = "error" | "warning" | "info";

// Validation result interface
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	sanitized?: any;
}

/**
 * Sanitize string input
 */
export function sanitizeString(value: any, maxLength: number = 500): string {
	if (typeof value !== "string") return "";

	return value
		.trim()
		.replace(/[<>"']/g, "") // Remove potentially dangerous characters
		.substring(0, maxLength);
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(value: any, baseUrl?: string): string | null {
	if (typeof value !== "string" || !value.trim()) return null;

	let url = value.trim();

	// Add base URL if provided and URL is relative
	if (baseUrl && url.startsWith("/")) {
		url = baseUrl + url;
	}

	// Basic URL validation
	if (!URL_PATTERN.test(url)) {
		return null;
	}

	try {
		new URL(url);
		return url;
	} catch {
		return null;
	}
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(value: any): string | null {
	if (typeof value !== "string" || !value.trim()) return null;

	const email = value.trim().toLowerCase();

	if (!EMAIL_PATTERN.test(email)) {
		return null;
	}

	return email;
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(value: any): string | null {
	if (typeof value !== "string" || !value.trim()) return null;

	const phone = value.trim();

	if (!PHONE_PATTERN.test(phone)) {
		return null;
	}

	// Remove common formatting but keep + for international
	return phone.replace(/[^\d+]/g, "");
}

/**
 * Sanitize coordinate value
 */
export function sanitizeCoordinate(value: any): number | null {
	if (typeof value !== "number" && typeof value !== "string") return null;

	const coord = typeof value === "string" ? parseFloat(value) : value;

	if (typeof coord !== "number" || !COORDINATE_PATTERN.test(coord.toString())) {
		return null;
	}

	// Validate coordinate ranges
	if (coord < -180 || coord > 180) {
		return null;
	}

	return coord;
}

/**
 * Sanitize array input
 */
export function sanitizeArray(
	value: any,
	validator?: (item: any) => boolean,
): string[] {
	if (!Array.isArray(value)) return [];

	const result = value
		.filter((item) => typeof item === "string")
		.map((item) => item.trim())
		.filter((item) => item.length > 0);

	if (validator) {
		return result.filter(validator);
	}

	return result;
}

/**
 * Sanitize social media links
 */
export function sanitizeSocialMedia(
	socialMedia: any,
): Record<string, string | null> {
	if (typeof socialMedia !== "object" || socialMedia === null) {
		return {};
	}

	const result: Record<string, string | null> = {};

	for (const [platform, url] of Object.entries(socialMedia)) {
		if (typeof url === "string") {
			const pattern =
				SOCIAL_MEDIA_PATTERNS[platform as keyof typeof SOCIAL_MEDIA_PATTERNS];
			if (pattern) {
				result[platform] = pattern.test(url) ? url : null;
			} else {
				result[platform] = sanitizeUrl(url);
			}
		}
	}

	return result;
}

/**
 * Validate organizer data
 */
export function validateOrganizer(organizer: any): ValidationResult {
	const result: ValidationResult = {
		isValid: true,
		errors: [],
		warnings: [],
		sanitized: { ...organizer },
	};

	// Validate required fields
	if (!organizer.id || typeof organizer.id !== "number") {
		result.errors.push("Organizer ID is required and must be a number");
		result.isValid = false;
	}

	if (!organizer.organizer || typeof organizer.organizer !== "string") {
		result.errors.push("Organizer name is required");
		result.isValid = false;
	} else {
		result.sanitized.organizer = sanitizeString(organizer.organizer, 100);
	}

	if (!organizer.slug || typeof organizer.slug !== "string") {
		result.errors.push("Organizer slug is required");
		result.isValid = false;
	} else {
		result.sanitized.slug = sanitizeString(organizer.slug, 50);
	}

	// Validate URLs
	result.sanitized.website = sanitizeUrl(organizer.website);
	if (!result.sanitized.website) {
		result.warnings.push("Website URL is invalid");
	}

	// Validate contact information
	if (organizer.phone) {
		result.sanitized.phone = sanitizePhone(organizer.phone);
		if (!result.sanitized.phone) {
			result.warnings.push("Phone number format is invalid");
		}
	}

	if (organizer.email) {
		result.sanitized.email = sanitizeEmail(organizer.email);
		if (!result.sanitized.email) {
			result.warnings.push("Email format is invalid");
		}
	}

	// Validate description
	if (organizer.description) {
		result.sanitized.description = sanitizeString(organizer.description, 2000);
	}

	// Validate social media
	if (organizer.socialMedia) {
		result.sanitized.socialMedia = sanitizeSocialMedia(organizer.socialMedia);
	}

	// Validate organization type
	if (organizer.details?.organizationType) {
		if (
			!VALID_ORGANIZATION_TYPES.includes(organizer.details.organizationType)
		) {
			result.warnings.push("Invalid organization type");
		}
	}

	// Validate tags and keywords
	if (organizer.details?.tags) {
		result.sanitized.details.tags = sanitizeArray(
			organizer.details.tags,
			(tag) => typeof tag === "string" && tag.length >= 2 && tag.length <= 50,
		);
	}

	if (organizer.details?.keywords) {
		result.sanitized.details.keywords = sanitizeArray(
			organizer.details.keywords,
			(keyword) =>
				typeof keyword === "string" &&
				keyword.length >= 2 &&
				keyword.length <= 30,
		);
	}

	// Validate media URLs
	if (organizer.media?.featuredImage) {
		result.sanitized.media.featuredImage = sanitizeUrl(
			organizer.media.featuredImage,
		);
	}

	if (organizer.media?.gallery) {
		result.sanitized.media.gallery = organizer.media.gallery
			.filter((url: any) => sanitizeUrl(url))
			.slice(0, 10); // Limit to 10 images
	}

	return result;
}

/**
 * Validate venue data
 */
export function validateVenue(venue: any): ValidationResult {
	const result: ValidationResult = {
		isValid: true,
		errors: [],
		warnings: [],
		sanitized: { ...venue },
	};

	// Validate required fields
	if (!venue.id || typeof venue.id !== "number") {
		result.errors.push("Venue ID is required and must be a number");
		result.isValid = false;
	}

	if (!venue.venue || typeof venue.venue !== "string") {
		result.errors.push("Venue name is required");
		result.isValid = false;
	} else {
		result.sanitized.venue = sanitizeString(venue.venue, 100);
	}

	if (!venue.city || typeof venue.city !== "string") {
		result.errors.push("City is required");
		result.isValid = false;
	} else {
		result.sanitized.city = sanitizeString(venue.city, 50);
	}

	// Validate address
	if (venue.address) {
		result.sanitized.address = sanitizeString(venue.address, 200);
	}

	// Validate coordinates
	if (venue.geo_lat !== undefined) {
		result.sanitized.geo_lat = sanitizeCoordinate(venue.geo_lat);
		if (result.sanitized.geo_lat === null && venue.geo_lat !== null) {
			result.warnings.push("Invalid latitude value");
		}
	}

	if (venue.geo_lng !== undefined) {
		result.sanitized.geo_lng = sanitizeCoordinate(venue.geo_lng);
		if (result.sanitized.geo_lng === null && venue.geo_lng !== null) {
			result.warnings.push("Invalid longitude value");
		}
	}

	// Validate website
	result.sanitized.website = sanitizeUrl(venue.website);
	if (!result.sanitized.website) {
		result.warnings.push("Website URL is invalid");
	}

	// Validate contact information
	if (venue.contact?.phone) {
		result.sanitized.contact.phone = sanitizePhone(venue.contact.phone);
		if (!result.sanitized.contact.phone) {
			result.warnings.push("Phone number format is invalid");
		}
	}

	if (venue.contact?.email) {
		result.sanitized.contact.email = sanitizeEmail(venue.contact.email);
		if (!result.sanitized.contact.email) {
			result.warnings.push("Email format is invalid");
		}
	}

	// Validate location details
	if (venue.location) {
		result.sanitized.location = {
			...venue.location,
			address: venue.location.address
				? sanitizeString(venue.location.address, 200)
				: undefined,
			city: venue.location.city
				? sanitizeString(venue.location.city, 50)
				: undefined,
		};

		if (venue.location.coordinates) {
			result.sanitized.location.coordinates = {
				latitude: sanitizeCoordinate(venue.location.coordinates.latitude),
				longitude: sanitizeCoordinate(venue.location.coordinates.longitude),
			};
		}
	}

	// Validate social media
	if (venue.socialMedia) {
		result.sanitized.socialMedia = sanitizeSocialMedia(venue.socialMedia);
	}

	// Validate description
	if (venue.details?.description) {
		result.sanitized.details.description = sanitizeString(
			venue.details.description,
			3000,
		);
	}

	// Validate tags and keywords
	if (venue.details?.tags) {
		result.sanitized.details.tags = sanitizeArray(
			venue.details.tags,
			(tag) => typeof tag === "string" && tag.length >= 2 && tag.length <= 50,
		);
	}

	if (venue.details?.keywords) {
		result.sanitized.details.keywords = sanitizeArray(
			venue.details.keywords,
			(keyword) =>
				typeof keyword === "string" &&
				keyword.length >= 2 &&
				keyword.length <= 30,
		);
	}

	// Validate media URLs
	if (venue.media?.featuredImage) {
		result.sanitized.media.logo = sanitizeUrl(venue.media.featuredImage);
	}

	if (venue.media?.gallery) {
		result.sanitized.media.gallery = venue.media.gallery
			.filter((url: any) => sanitizeUrl(url))
			.slice(0, 10); // Limit to 10 images
	}

	// Validate capacity
	if (venue.facilities?.capacity) {
		const capacity = Number(venue.facilities.capacity);
		if (Number.isInteger(capacity) && capacity > 0) {
			result.sanitized.facilities.capacity = capacity;
		} else {
			result.warnings.push("Capacity must be a positive integer");
		}
	}

	return result;
}

/**
 * Sanitize and validate EnhancedOrganizer
 */
export function sanitizeAndValidateOrganizer(
	organizer: any,
): EnhancedOrganizer | null {
	const validation = validateOrganizer(organizer);

	if (!validation.isValid) {
		console.error("Invalid organizer data:", validation.errors);
		return null;
	}

	return validation.sanitized as EnhancedOrganizer;
}

/**
 * Sanitize and validate EnhancedVenue
 */
export function sanitizeAndValidateVenue(venue: any): EnhancedVenue | null {
	const validation = validateVenue(venue);

	if (!validation.isValid) {
		console.error("Invalid venue data:", validation.errors);
		return null;
	}

	return validation.sanitized as EnhancedVenue;
}

/**
 * Batch validate organizers
 */
export function batchValidateOrganizers(organizers: any[]): ValidationResult[] {
	return organizers.map((organizer) => validateOrganizer(organizer));
}

/**
 * Batch validate venues
 */
export function batchValidateVenues(venues: any[]): ValidationResult[] {
	return venues.map((venue) => validateVenue(venue));
}
