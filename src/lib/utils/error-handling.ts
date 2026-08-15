/**
 * Fallback data wrapper and generator for organizer/venue fetching
 */

import type { EnhancedOrganizer, EnhancedVenue } from "$lib/types";

// ── Inline sanitization helpers (previously in data-validation.ts) ──────────

const URL_PATTERN = /^https?:\/\/.+(\.[a-z]{2,})+$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s\-()]+$/;
const COORDINATE_PATTERN = /^-?\d+(\.\d+)?$/;

function sanitizeString(value: any, maxLength: number = 500): string {
    if (typeof value !== "string") return "";
    return value.trim().replace(/[<>"']/g, "").substring(0, maxLength);
}

function sanitizeUrl(value: any, baseUrl?: string): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    let url = value.trim();
    if (baseUrl && url.startsWith("/")) url = baseUrl + url;
    if (!URL_PATTERN.test(url)) return null;
    try { return new URL(url).href; } catch { return null; }
}

function sanitizeEmail(value: any): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    const email = value.trim().toLowerCase();
    return EMAIL_PATTERN.test(email) ? email : null;
}

function sanitizePhone(value: any): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    const phone = value.trim();
    return PHONE_PATTERN.test(phone) ? phone.replace(/[^\d+]/g, "") : null;
}

function sanitizeCoordinate(value: any): number | null {
    if (typeof value !== "number" && typeof value !== "string") return null;
    const coord = typeof value === "string" ? parseFloat(value) : value;
    if (typeof coord !== "number" || !COORDINATE_PATTERN.test(coord.toString())) return null;
    return coord >= -180 && coord <= 180 ? coord : null;
}

function sanitizeSocialMedia(socialMedia: any): Record<string, string | null> {
    if (typeof socialMedia !== "object" || socialMedia === null) return {};
    const result: Record<string, string | null> = {};
    const SOCIAL_MEDIA_PATTERNS: Record<string, RegExp> = {
        facebook: /^https:\/\/(www\.)?facebook\.com\/.+/i,
        instagram: /^https:\/\/(www\.)?instagram\.com\/.+/i,
        twitter: /^https:\/\/(www\.)?twitter\.com\/.+/i,
        youtube: /^https:\/\/(www\.)?youtube\.com\/.+/i,
        spotify: /^https:\/\/(www\.)?spotify\.com\/.+/i,
        soundcloud: /^https:\/\/(www\.)?soundcloud\.com\/.+/i,
    };
    for (const [platform, url] of Object.entries(socialMedia)) {
        if (typeof url === "string") {
            const pattern = SOCIAL_MEDIA_PATTERNS[platform as keyof typeof SOCIAL_MEDIA_PATTERNS];
            result[platform] = pattern ? (pattern.test(url) ? url : null) : sanitizeUrl(url);
        }
    }
    return result;
}

// ── Inline validators (previously in data-validation.ts) ────────────────────

function validateOrganizer(organizer: any): { isValid: boolean; sanitized: any; errors: string[]; warnings: string[] } {
    const result: { isValid: boolean; sanitized: any; errors: string[]; warnings: string[] } = {
        isValid: true,
        sanitized: { ...organizer },
        errors: [],
        warnings: [],
    };

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
    result.sanitized.website = sanitizeUrl(organizer.website);
    if (!result.sanitized.website) result.warnings.push("Website URL is invalid");
    if (organizer.phone) {
        result.sanitized.phone = sanitizePhone(organizer.phone);
        if (!result.sanitized.phone) result.warnings.push("Phone number format is invalid");
    }
    if (organizer.email) {
        result.sanitized.email = sanitizeEmail(organizer.email);
        if (!result.sanitized.email) result.warnings.push("Email format is invalid");
    }
    if (organizer.description) {
        result.sanitized.description = sanitizeString(organizer.description, 2000);
    }
    if (organizer.socialMedia) {
        result.sanitized.socialMedia = sanitizeSocialMedia(organizer.socialMedia);
    }
    if (organizer.media?.featuredImage) {
        result.sanitized.media = result.sanitized.media || {};
        result.sanitized.media.featuredImage = sanitizeUrl(organizer.media.featuredImage);
    }
    if (organizer.media?.gallery) {
        result.sanitized.media = result.sanitized.media || {};
        result.sanitized.media.gallery = (organizer.media.gallery as string[])
            ?.filter((url: string) => sanitizeUrl(url))
            .slice(0, 10);
    }
    return result;
}

function validateVenue(venue: any): { isValid: boolean; sanitized: any; errors: string[]; warnings: string[] } {
    const result: { isValid: boolean; sanitized: any; errors: string[]; warnings: string[] } = {
        isValid: true,
        sanitized: { ...venue },
        errors: [],
        warnings: [],
    };

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
    if (venue.address) {
        result.sanitized.address = sanitizeString(venue.address, 200);
    }
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
    result.sanitized.website = sanitizeUrl(venue.website);
    if (!result.sanitized.website) result.warnings.push("Website URL is invalid");
    if (venue.contact?.phone) {
        result.sanitized.contact = result.sanitized.contact || {};
        result.sanitized.contact.phone = sanitizePhone(venue.contact.phone);
        if (!result.sanitized.contact.phone) result.warnings.push("Phone number format is invalid");
    }
    if (venue.contact?.email) {
        result.sanitized.contact = result.sanitized.contact || {};
        result.sanitized.contact.email = sanitizeEmail(venue.contact.email);
        if (!result.sanitized.contact.email) result.warnings.push("Email format is invalid");
    }
    if (venue.socialMedia) {
        result.sanitized.socialMedia = sanitizeSocialMedia(venue.socialMedia);
    }
    return result;
}

// ── Public API (previously exported from data-validation.ts) ────────────────

function sanitizeAndValidateOrganizer(organizer: any): EnhancedOrganizer | null {
    const validation = validateOrganizer(organizer);
    if (!validation.isValid) {
        console.error("Invalid organizer data:", validation.errors);
        return null;
    }
    return validation.sanitized as EnhancedOrganizer;
}

function sanitizeAndValidateVenue(venue: any): EnhancedVenue | null {
    const validation = validateVenue(venue);
    if (!validation.isValid) {
        console.error("Invalid venue data:", validation.errors);
        return null;
    }
    return validation.sanitized as EnhancedVenue;
}

/**
 * Wrapper for enhanced organizer fetching with error handling
 */
export async function fetchEnhancedOrganizersWithErrorHandling(
    basicOrganizers: any[],
    fetcher: typeof fetch = fetch,
): Promise<FallbackData<EnhancedOrganizer[]>> {
    const warnings: string[] = [];

    try {
        const enhancedResults = await Promise.allSettled(
            basicOrganizers.map(async (organizer) => {
                try {
                    const response = await fetcher(
                        `/api/organizers/${organizer.id}?_embed=wp:featuredmedia`,
                    );

                    if (!response.ok) {
                        warnings.push(
                            `Failed to fetch organizer ${organizer.id}: HTTP ${response.status}`,
                        );
                        return FallbackDataGenerator.generateFallbackOrganizer(organizer);
                    }

                    const rawData = await response.json();
                    const validated = sanitizeAndValidateOrganizer({
                        ...organizer,
                        ...rawData,
                    });

                    if (!validated) {
                        warnings.push(`Failed to validate organizer ${organizer.id}`);
                        return FallbackDataGenerator.generateFallbackOrganizer(organizer);
                    }

                    return validated;
                } catch (error) {
                    warnings.push(
                        `Failed to enhance organizer ${organizer.id}: ${error instanceof Error ? error.message : String(error)}`,
                    );
                    return FallbackDataGenerator.generateFallbackOrganizer(organizer);
                }
            }),
        );

        const successfulResults = enhancedResults
            .filter(
                (result): result is PromiseFulfilledResult<EnhancedOrganizer> =>
                    result.status === "fulfilled",
            )
            .map((result) => result.value);

        return {
            hasFallback: true,
            data: successfulResults,
            error: null,
            warnings,
        };
    } catch (error) {
        return {
            hasFallback: false,
            data: basicOrganizers.map((organizer) =>
                FallbackDataGenerator.generateFallbackOrganizer(organizer),
            ),
            error: error instanceof Error ? error : null,
            warnings,
        };
    }
}

/**
 * Wrapper for enhanced venue fetching with error handling
 */
export async function fetchEnhancedVenuesWithErrorHandling(
    basicVenues: any[],
    fetcher: typeof fetch = fetch,
): Promise<FallbackData<EnhancedVenue[]>> {
    const warnings: string[] = [];

    try {
        const enhancedResults = await Promise.allSettled(
            basicVenues.map(async (venue) => {
                try {
                    const response = await fetcher(
                        `/api/venues/${venue.id}?_embed=wp:featuredmedia`,
                    );

                    if (!response.ok) {
                        warnings.push(
                            `Failed to fetch venue ${venue.id}: HTTP ${response.status}`,
                        );
                        return FallbackDataGenerator.generateFallbackVenue(venue);
                    }

                    const rawData = await response.json();
                    const validated = sanitizeAndValidateVenue({
                        ...venue,
                        ...rawData,
                    });

                    if (!validated) {
                        warnings.push(`Failed to validate venue ${venue.id}`);
                        return FallbackDataGenerator.generateFallbackVenue(venue);
                    }

                    return validated;
                } catch (error) {
                    warnings.push(
                        `Failed to enhance venue ${venue.id}: ${error instanceof Error ? error.message : String(error)}`,
                    );
                    return FallbackDataGenerator.generateFallbackVenue(venue);
                }
            }),
        );

        const successfulResults = enhancedResults
            .filter(
                (result): result is PromiseFulfilledResult<EnhancedVenue> =>
                    result.status === "fulfilled",
            )
            .map((result) => result.value);

        return {
            hasFallback: true,
            data: successfulResults,
            error: null,
            warnings,
        };
    } catch (error) {
        return {
            hasFallback: false,
            data: basicVenues.map((venue) =>
                FallbackDataGenerator.generateFallbackVenue(venue),
            ),
            error: error instanceof Error ? error : null,
            warnings,
        };
    }
}

/**
 * Fallback data container
 */
export interface FallbackData<T> {
    hasFallback: boolean;
    data: T | null;
    error: Error | null;
    warnings: string[];
}

/**
 * Generates fallback organizer data when enhancement fails
 */
export class FallbackDataGenerator {
    static generateFallbackOrganizer(basicOrganizer?: any): EnhancedOrganizer {
        return {
            id: basicOrganizer?.id || 0,
            organizer: basicOrganizer?.organizer || "Unknown Organizer",
            slug: basicOrganizer?.slug || "unknown-organizer",
            url: basicOrganizer?.url || "",
            website: basicOrganizer?.website || "",
            email: basicOrganizer?.email || "",
            phone: basicOrganizer?.phone || "",
            description: basicOrganizer?.description || "",
            image: basicOrganizer?.image || "",
            socialMedia: {},
            contact: {
                phone: basicOrganizer?.phone || "",
                email: basicOrganizer?.email || "",
            },
            details: {
                description: basicOrganizer?.description || "",
                tags: [],
                organizationType: "other",
            },
            media: {
                logo: undefined,
                gallery: [],
            },
            specializations: {
                musicStyles: [],
                eventTypes: [],
                targetAudience: [],
            },
            verification: {
                isVerified: false,
            },
            timestamps: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    static generateFallbackVenue(basicVenue?: any): EnhancedVenue {
        return {
            id: basicVenue?.id || 0,
            venue: basicVenue?.venue || "Unknown Venue",
            slug: basicVenue?.slug || "",
            address: basicVenue?.address || "",
            city: basicVenue?.city || "",
            geo_lat: basicVenue?.geo_lat || null,
            geo_lng: basicVenue?.geo_lng || null,
            website: basicVenue?.website || "",
            location: {
                address: basicVenue?.address || "",
                city: basicVenue?.city || "",
                coordinates:
                    basicVenue?.geo_lat && basicVenue?.geo_lng
                        ? {
                            latitude: basicVenue.geo_lat,
                            longitude: basicVenue.geo_lng,
                        }
                        : undefined,
            },
            contact: {
                phone: basicVenue?.phone || "",
                email: "",
                website: basicVenue?.website || "",
            },
            socialMedia: {},
            media: {
                logo: undefined,
                gallery: [],
            },
            facilities: {
                capacity: basicVenue?.capacity || 0,
                danceFloor: false,
                bar: false,
                parking: false,
                wheelchairAccessible: false,
            },
            details: {
                description: "",
                tags: [],
                keywords: [],
            },
            accessibility: {
                wheelchairAccessible: false,
                accessibleParking: false,
                accessibleEntrance: false,
                accessibleRestrooms: false,
                hearingAssistance: false,
                visualAssistance: false,
            },
            pricing: {
                entryFee: "",
                happyHour: "",
                bottleService: false,
                privateEvents: false,
                rentalInfo: undefined,
            },
            hours: {
                monday: "Geschlossen",
                tuesday: "Geschlossen",
                wednesday: "Geschlossen",
                thursday: "Geschlossen",
                friday: "Geschlossen",
                saturday: "Geschlossen",
                sunday: "Geschlossen",
            },
            verification: {
                isVerified: false,
            },
            timestamps: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }
}
