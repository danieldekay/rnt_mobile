/**
 * Enhanced error handling and fallback mechanisms for organizer and venue data fetching
 */

import type { EnhancedOrganizer, EnhancedVenue } from "$lib/types";
import {
	sanitizeAndValidateOrganizer,
	sanitizeAndValidateVenue,
} from "./data-validation";

export interface APIError {
	type: "network" | "validation" | "parsing" | "server" | "timeout";
	message: string;
	code?: string | number;
	timestamp: string;
	context?: Record<string, any>;
}

export interface FallbackData<T> {
	hasFallback: boolean;
	data: T | null;
	error: APIError | null;
	warnings: string[];
}

/**
 * Enhanced error class for API operations
 */
export class EnhancedAPIError extends Error {
	public readonly type: APIError["type"];
	public readonly code?: string | number;
	public readonly context?: Record<string, any>;
	public readonly timestamp: string;

	constructor(
		type: APIError["type"],
		message: string,
		code?: string | number,
		context?: Record<string, any>,
	) {
		super(message);
		this.name = "EnhancedAPIError";
		this.type = type;
		this.code = code;
		this.context = context;
		this.timestamp = new Date().toISOString();
	}

	toJSON(): APIError {
		return {
			type: this.type,
			message: this.message,
			code: this.code,
			timestamp: this.timestamp,
			context: this.context,
		};
	}
}

/**
 * Network error handler
 */
export function handleNetworkError(
	response: Response,
	context?: Record<string, any>,
): EnhancedAPIError {
	const status = response.status;
	let message = `Network error: ${status}`;
	let type: APIError["type"] = "network";

	if (status >= 500) {
		message = `Server error: ${status} - Please try again later`;
		type = "server";
	} else if (status === 404) {
		message = "Resource not found";
		type = "server";
	} else if (status === 401 || status === 403) {
		message = "Access denied";
		type = "server";
	} else if (status >= 400 && status < 500) {
		message = `Request error: ${status}`;
		type = "network";
	}

	return new EnhancedAPIError(type, message, status, {
		url: response.url,
		status,
		headers: Object.fromEntries(response.headers.entries()),
		...context,
	});
}

/**
 * Validation error handler
 */
export function handleValidationError(
	data: any,
	entityType: "organizer" | "venue",
): EnhancedAPIError {
	const { validateOrganizer, validateVenue } = require("./data-validation");
	const validationFn =
		entityType === "organizer" ? validateOrganizer : validateVenue;
	const result = validationFn(data);

	if (result.isValid) {
		// This shouldn't happen, but we'll return a generic error
		return new EnhancedAPIError(
			"validation",
			"Unexpected validation error",
			"VALIDATION_FAILED",
		);
	}

	return new EnhancedAPIError(
		"validation",
		`Invalid ${entityType} data: ${result.errors.join(", ")}`,
		"VALIDATION_ERROR",
		{
			errors: result.errors,
			warnings: result.warnings,
			entityType,
		},
	);
}

/**
 * Parse error handler
 */
export function handleParseError(
	error: unknown,
	context?: Record<string, any>,
): EnhancedAPIError {
	let message = "Failed to parse response data";
	const type: APIError["type"] = "parsing";

	if (error instanceof SyntaxError) {
		message = `JSON parsing error: ${error.message}`;
	} else if (error instanceof Error) {
		message = `Parsing error: ${error.message}`;
	}

	return new EnhancedAPIError(type, message, "PARSE_ERROR", {
		originalError: error instanceof Error ? error.message : String(error),
		...context,
	});
}

/**
 * Timeout error handler
 */
export function handleTimeoutError(
	operation: string,
	timeoutMs: number,
): EnhancedAPIError {
	return new EnhancedAPIError(
		"timeout",
		`${operation} timed out after ${timeoutMs}ms`,
		"TIMEOUT_ERROR",
		{ timeoutMs, operation },
	);
}

/**
 * Retry configuration
 */
export interface RetryConfig {
	maxRetries: number;
	baseDelayMs: number;
	maxDelayMs: number;
	backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	baseDelayMs: 1000,
	maxDelayMs: 10000,
	backoffFactor: 2,
};

/**
 * Execute with retry
 */
export async function executeWithRetry<T>(
	operation: () => Promise<T>,
	config: RetryConfig = DEFAULT_RETRY_CONFIG,
	context?: Record<string, any>,
): Promise<FallbackData<T>> {
	const _startTime = Date.now();
	let lastError: APIError | null = null;
	const warnings: string[] = [];

	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			const result = await Promise.race([
				operation(),
				new Promise<never>((_, reject) =>
					setTimeout(
						() => reject(handleTimeoutError("API request", 30000)),
						30000,
					),
				),
			]);

			return {
				hasFallback: true,
				data: result,
				error: null,
				warnings,
			};
		} catch (error) {
			lastError =
				error instanceof EnhancedAPIError
					? error
					: error instanceof Error
						? handleParseError(error, context)
						: handleParseError(String(error), context);

			warnings.push(`Attempt ${attempt + 1} failed: ${lastError.message}`);

			if (attempt < config.maxRetries) {
				const delayMs = Math.min(
					config.baseDelayMs * config.backoffFactor ** attempt,
					config.maxDelayMs,
				);

				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
		}
	}

	return {
		hasFallback: false,
		data: null,
		error: lastError,
		warnings,
	};
}

/**
 * Fallback data generators
 */
export class FallbackDataGenerator {
	/**
	 * Generate fallback organizer data
	 */
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

	/**
	 * Generate fallback venue data
	 */
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

/**
 * Wrapper for enhanced organizer fetching with error handling
 */
export async function fetchEnhancedOrganizersWithErrorHandling(
	basicOrganizers: any[],
	fetcher: typeof fetch = fetch,
): Promise<FallbackData<EnhancedOrganizer[]>> {
	const _startTime = Date.now();
	const warnings: string[] = [];

	try {
		const enhancedResults = await Promise.allSettled(
			basicOrganizers.map(async (organizer) => {
				try {
					// Fetch additional data
					const response = await fetcher(
						`/api/organizers/${organizer.id}?_embed=wp:featuredmedia`,
					);

					if (!response.ok) {
						throw handleNetworkError(response, { organizerId: organizer.id });
					}

					const rawData = await response.json();

					// Validate and sanitize
					const validated = validateAndSanitizeOrganizer({
						...organizer,
						...rawData,
					});

					if (!validated) {
						throw handleValidationError(rawData, "organizer");
					}

					return validated;
				} catch (error) {
					warnings.push(
						`Failed to enhance organizer ${organizer.id}: ${error instanceof Error ? error.message : String(error)}`,
					);
					// Return fallback data
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
		const apiError =
			error instanceof EnhancedAPIError
				? error
				: error instanceof Error
					? handleParseError(error)
					: handleParseError(String(error));

		return {
			hasFallback: false,
			data: basicOrganizers.map((organizer) =>
				FallbackDataGenerator.generateFallbackOrganizer(organizer),
			),
			error: apiError,
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
	const _startTime = Date.now();
	const warnings: string[] = [];

	try {
		const enhancedResults = await Promise.allSettled(
			basicVenues.map(async (venue) => {
				try {
					// Fetch additional data
					const response = await fetcher(
						`/api/venues/${venue.id}?_embed=wp:featuredmedia`,
					);

					if (!response.ok) {
						throw handleNetworkError(response, { venueId: venue.id });
					}

					const rawData = await response.json();

					// Validate and sanitize
					const validated = validateAndSanitizeVenue({
						...venue,
						...rawData,
					});

					if (!validated) {
						throw handleValidationError(rawData, "venue");
					}

					return validated;
				} catch (error) {
					warnings.push(
						`Failed to enhance venue ${venue.id}: ${error instanceof Error ? error.message : String(error)}`,
					);
					// Return fallback data
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
		const apiError =
			error instanceof EnhancedAPIError
				? error
				: error instanceof Error
					? handleParseError(error)
					: handleParseError(String(error));

		return {
			hasFallback: false,
			data: basicVenues.map((venue) =>
				FallbackDataGenerator.generateFallbackVenue(venue),
			),
			error: apiError,
			warnings,
		};
	}
}

// Internal validation helpers (using the validation functions from data-validation)
function validateAndSanitizeOrganizer(data: any): EnhancedOrganizer | null {
	return sanitizeAndValidateOrganizer(data);
}

function validateAndSanitizeVenue(data: any): EnhancedVenue | null {
	return sanitizeAndValidateVenue(data);
}
