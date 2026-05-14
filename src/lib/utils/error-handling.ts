/**
 * Fallback data wrapper and generator for organizer/venue fetching
 */

import type { EnhancedOrganizer, EnhancedVenue } from "$lib/types";
import {
    sanitizeAndValidateOrganizer,
    sanitizeAndValidateVenue,
} from "./data-validation";

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
