/**
 * Unit tests for enhanced organizer and venue API functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	fetchEnhancedOrganizers,
	fetchEnhancedVenues,
	fetchEnhancedOrganizersWithErrorHandling,
	fetchEnhancedVenuesWithErrorHandling,
} from "./tribe";
import {
	CacheUtils,
	organizerCache,
	venueCache,
	generateOrganizerKey,
	generateVenueKey,
	CacheManager,
} from "../utils/caching";
import { FallbackDataGenerator } from "../utils/error-handling";

// Mock fetch function
const mockFetch = vi.fn();

// Mock data
const mockOrganizerData = {
	id: 1,
	organizer: "Test Organizer",
	slug: "test-organizer",
	url: "https://example.com/organizer/1",
	website: "https://test-organizer.com",
	email: "test@test-organizer.com",
	phone: "+49 123 456789",
	description: "Test organizer description",
	image: "https://example.com/image.jpg",
};

const mockVenueData = {
	id: 1,
	venue: "Test Venue",
	address: "Test Street 1",
	city: "Test City",
	geo_lat: 49.0123,
	geo_lng: 8.1234,
	website: "https://test-venue.com",
};

const mockEnhancedOrganizerData = {
	...mockOrganizerData,
	socialMedia: {
		facebook: "https://facebook.com/testorganizer",
		instagram: "https://instagram.com/testorganizer",
	},
	contact: {
		phone: "+49 123 456789",
		email: "test@test-organizer.com",
	},
	details: {
		description: "Test organizer description",
		tags: ["tango", "events"],
	},
	media: {
		logo: "https://example.com/logo.jpg",
		gallery: ["https://example.com/image1.jpg"],
	},
	verification: {
		isVerified: true,
	},
	timestamps: {
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
	},
};

const mockEnhancedVenueData = {
	...mockVenueData,
	location: {
		address: "Test Street 1",
		city: "Test City",
		coordinates: {
			latitude: 49.0123,
			longitude: 8.1234,
		},
	},
	contact: {
		phone: "+49 123 456789",
		email: "info@test-venue.com",
		website: "https://test-venue.com",
	},
	socialMedia: {
		website: "https://test-venue.com",
	},
	media: {
		logo: "https://example.com/venue-logo.jpg",
		gallery: ["https://example.com/venue-image1.jpg"],
	},
	facilities: {
		capacity: 100,
		wheelchairAccessible: true,
	},
	details: {
		description: "Test venue description",
		tags: ["tango", "venue"],
	},
	accessibility: {
		wheelchairAccessible: true,
		accessibleParking: false,
		accessibleEntrance: true,
		accessibleRestrooms: true,
		hearingAssistance: false,
		visualAssistance: false,
	},
	pricing: {
		entryFee: "10€",
		happyHour: "5€",
		bottleService: false,
		privateEvents: true,
	},
	hours: {
		monday: "20:00-24:00",
		tuesday: "20:00-24:00",
		wednesday: "20:00-24:00",
		thursday: "20:00-24:00",
		friday: "20:00-24:00",
		saturday: "20:00-24:00",
		sunday: "20:00-24:00",
	},
	verification: {
		isVerified: true,
	},
	timestamps: {
		createdAt: "2023-01-01T00:00:00Z",
		updatedAt: "2023-01-01T00:00:00Z",
	},
};

describe("Enhanced API Functions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear cache before each test
		organizerCache.clear();
		venueCache.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("fetchEnhancedOrganizers", () => {
		it("should fetch enhanced organizers successfully", async () => {
			// Mock enhanced data fetch
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							organizers: [mockEnhancedOrganizerData],
						}),
				}),
			);

			const result = await fetchEnhancedOrganizers(mockFetch);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/organizers/1?_embed=wp:featuredmedia",
			);
			expect(result).toEqual([mockEnhancedOrganizerData]);
		});

		it("should handle empty organizer list", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							organizers: [],
						}),
				}),
			);

			const result = await fetchEnhancedOrganizers(mockFetch);
			expect(result).toEqual([]);
		});

		it("should handle network error gracefully", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: false,
					status: 404,
				}),
			);

			const result = await fetchEnhancedOrganizers(mockFetch);
			expect(result).toEqual([
				expect.objectContaining({
					id: 1,
					organizer: "Unknown Organizer",
				}),
			]);
		});

		it("should handle JSON parsing error", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.reject(new Error("Invalid JSON")),
				}),
			);

			const result = await fetchEnhancedOrganizers(mockFetch);
			expect(result).toEqual([
				expect.objectContaining({
					id: 1,
					organizer: "Unknown Organizer",
				}),
			]);
		});
	});

	describe("fetchEnhancedVenues", () => {
		it("should fetch enhanced venues successfully", async () => {
			// Mock enhanced data fetch
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							venues: [mockEnhancedVenueData],
						}),
				}),
			);

			const result = await fetchEnhancedVenues(mockFetch);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/venues/1?_embed=wp:featuredmedia",
			);
			expect(result).toEqual([mockEnhancedVenueData]);
		});

		it("should handle empty venue list", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							venues: [],
						}),
				}),
			);

			const result = await fetchEnhancedVenues(mockFetch);
			expect(result).toEqual([]);
		});

		it("should handle network error gracefully", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: false,
					status: 404,
				}),
			);

			const result = await fetchEnhancedVenues(mockFetch);
			expect(result).toEqual([
				expect.objectContaining({
					id: 1,
					venue: "Unknown Venue",
				}),
			]);
		});
	});

	describe("fetchEnhancedOrganizersWithErrorHandling", () => {
		it("should return fallback data when API fails", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: false,
					status: 500,
				}),
			);

			const result = await fetchEnhancedOrganizersWithErrorHandling(
				[mockOrganizerData],
				mockFetch,
			);

			expect(result.hasFallback).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data![0]).toEqual(
				expect.objectContaining({
					id: 1,
					organizer: "Unknown Organizer",
				}),
			);
			expect(result.error).not.toBeNull();
			expect(result.warnings).toHaveLength(1);
		});

		it("should handle partial success in batch processing", async () => {
			const mockOrganizers = [
				{ ...mockOrganizerData, id: 1 },
				{ ...mockOrganizerData, id: 2 },
			];

			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: false,
					status: 404,
				}),
			);

			const result = await fetchEnhancedOrganizersWithErrorHandling(
				mockOrganizers,
				mockFetch,
			);

			expect(result.hasFallback).toBe(true);
			expect(result.data).toHaveLength(2);
			expect(result.warnings).toHaveLength(2);
		});
	});

	describe("fetchEnhancedVenuesWithErrorHandling", () => {
		it("should return fallback data when API fails", async () => {
			mockFetch.mockImplementationOnce(() =>
				Promise.resolve({
					ok: false,
					status: 500,
				}),
			);

			const result = await fetchEnhancedVenuesWithErrorHandling(
				[mockVenueData],
				mockFetch,
			);

			expect(result.hasFallback).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data![0]).toEqual(
				expect.objectContaining({
					id: 1,
					venue: "Unknown Venue",
				}),
			);
			expect(result.error).not.toBeNull();
			expect(result.warnings).toHaveLength(1);
		});
	});
});

describe("Caching Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		organizerCache.clear();
		venueCache.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("CacheUtils", () => {
		it("should cache and retrieve organizers", async () => {
			const cacheKey = generateOrganizerKey(1);

			// First call should fetch and cache
			const result1 = await CacheUtils.getOrganizer(
				1,
				async () => mockEnhancedOrganizerData,
			);
			expect(result1).toEqual(mockEnhancedOrganizerData);

			// Second call should use cache
			const result2 = await CacheUtils.getOrganizer(1, async () => {
				throw new Error("Should not be called");
			});
			expect(result2).toEqual(mockEnhancedOrganizerData);

			// Verify cache contains the data
			const cached = organizerCache.get(cacheKey);
			expect(cached).toEqual(mockEnhancedOrganizerData);
		});

		it("should cache and retrieve venues", async () => {
			const cacheKey = generateVenueKey(1);

			// First call should fetch and cache
			const result1 = await CacheUtils.getVenue(
				1,
				async () => mockEnhancedVenueData,
			);
			expect(result1).toEqual(mockEnhancedVenueData);

			// Second call should use cache
			const result2 = await CacheUtils.getVenue(1, async () => {
				throw new Error("Should not be called");
			});
			expect(result2).toEqual(mockEnhancedVenueData);

			// Verify cache contains the data
			const cached = venueCache.get(cacheKey);
			expect(cached).toEqual(mockEnhancedVenueData);
		});

		it("should handle cache invalidation", () => {
			const cacheKey = generateOrganizerKey(1);

			// Set cache
			organizerCache.set(cacheKey, mockEnhancedOrganizerData);
			expect(organizerCache.get(cacheKey)).toEqual(mockEnhancedOrganizerData);

			// Invalidate single item
			CacheUtils.invalidateOrganizer(1);
			expect(organizerCache.get(cacheKey)).toBeNull();

			// Invalidate all
			organizerCache.set(cacheKey, mockEnhancedOrganizerData);
			CacheUtils.invalidateOrganizer();
			expect(organizerCache.get(cacheKey)).toBeNull();
		});

		it("should handle batch caching for organizers", async () => {
			const mockOrganizers = [
				{ ...mockEnhancedOrganizerData, id: 1 },
				{ ...mockEnhancedOrganizerData, id: 2 },
			];

			const result = await CacheUtils.getOrganizers(
				[1, 2],
				async () => mockOrganizers,
			);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);

			// Verify both are cached
			expect(organizerCache.get("organizer:1")).toEqual(mockOrganizers[0]);
			expect(organizerCache.get("organizer:2")).toEqual(mockOrganizers[1]);
		});

		it("should handle batch caching for venues", async () => {
			const mockVenues = [
				{ ...mockEnhancedVenueData, id: 1 },
				{ ...mockEnhancedVenueData, id: 2 },
			];

			const result = await CacheUtils.getVenues([1, 2], async () => mockVenues);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[1].id).toBe(2);

			// Verify both are cached
			expect(venueCache.get("venue:1")).toEqual(mockVenues[0]);
			expect(venueCache.get("venue:2")).toEqual(mockVenues[1]);
		});

		it("should provide cache statistics", () => {
			// Add some test data
			organizerCache.set("organizer:1", mockEnhancedOrganizerData);
			organizerCache.set("organizer:2", mockEnhancedOrganizerData);

			const stats = CacheUtils.getStats();

			expect(stats.organizers.totalItems).toBe(2);
			expect(stats.organizers.totalAccessCount).toBe(0);
			expect(stats.venues.totalItems).toBe(0);
		});
	});

	describe("CacheManager", () => {
		it("should respect TTL configuration", async () => {
			const shortCache = new (class extends CacheManager<
				typeof mockEnhancedOrganizerData
			> {
				constructor() {
					super({ enabled: true, ttl: 100, maxSize: 10, cleanupInterval: 0 });
				}
			})();

			const cacheKey = generateOrganizerKey(1);

			// Set cache
			shortCache.set(cacheKey, mockEnhancedOrganizerData);
			expect(shortCache.get(cacheKey)).toEqual(mockEnhancedOrganizerData);

			// Wait for TTL to expire
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Cache should be expired
			expect(shortCache.get(cacheKey)).toBeNull();

			shortCache.destroy();
		});

		it("should respect max size with LRU eviction", () => {
			const smallCache = new (class extends CacheManager<
				typeof mockEnhancedOrganizerData
			> {
				constructor() {
					super({ enabled: true, ttl: 60000, maxSize: 2, cleanupInterval: 0 });
				}
			})();

			// Add items beyond max size
			smallCache.set("organizer:1", mockEnhancedOrganizerData);
			smallCache.set("organizer:2", mockEnhancedOrganizerData);
			smallCache.set("organizer:3", mockEnhancedOrganizerData);

			// First two items should be evicted
			expect(smallCache.get("organizer:1")).toBeNull();
			expect(smallCache.get("organizer:2")).toBeNull();
			expect(smallCache.get("organizer:3")).toEqual(mockEnhancedOrganizerData);

			smallCache.destroy();
		});
	});
});

describe("Fallback Data Generation", () => {
	it("should generate fallback organizer data", () => {
		const fallback = FallbackDataGenerator.generateFallbackOrganizer();

		expect(fallback.id).toBe(0);
		expect(fallback.organizer).toBe("Unknown Organizer");
		expect(fallback.slug).toBe("unknown-organizer");
		expect(fallback.website).toBe("");
		expect(fallback.email).toBe("");
		expect(fallback.phone).toBe("");
		expect(fallback.description).toBe("");
		expect(fallback.image).toBe("");
		expect(fallback.socialMedia).toEqual({});
		expect(fallback.contact).toEqual({
			phone: "",
			email: "",
		});
		expect(fallback.details).toEqual({
			description: "",
			tags: [],
			organizationType: "other",
		});
		expect(fallback.media).toEqual({
			logo: undefined,
			gallery: [],
		});
		expect(fallback.specializations).toEqual({
			musicStyles: [],
			eventTypes: [],
			targetAudience: [],
		});
		expect(fallback.verification).toEqual({
			isVerified: false,
		});
		expect(fallback.timestamps).toEqual({
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it("should generate fallback venue data", () => {
		const fallback = FallbackDataGenerator.generateFallbackVenue();

		expect(fallback.id).toBe(0);
		expect(fallback.venue).toBe("Unknown Venue");
		expect(fallback.address).toBe("");
		expect(fallback.city).toBe("");
		expect(fallback.website).toBe("");
		expect(fallback.geo_lat).toBeNull();
		expect(fallback.geo_lng).toBeNull();
		expect(fallback.location).toEqual({
			address: "",
			city: "",
			coordinates: undefined,
		});
		expect(fallback.contact).toEqual({
			phone: "",
			email: "",
			website: "",
		});
		expect(fallback.socialMedia).toEqual({});
		expect(fallback.media).toEqual({
			logo: undefined,
			gallery: [],
		});
		expect(fallback.facilities).toEqual({
			capacity: 0,
			danceFloor: false,
			bar: false,
			parking: false,
			wheelchairAccessible: false,
		});
		expect(fallback.details).toEqual({
			description: "",
			tags: [],
			keywords: [],
		});
		expect(fallback.accessibility).toEqual({
			wheelchairAccessible: false,
			accessibleParking: false,
			accessibleEntrance: false,
			accessibleRestrooms: false,
			hearingAssistance: false,
			visualAssistance: false,
		});
		expect(fallback.pricing).toEqual({
			entryFee: "",
			happyHour: "",
			bottleService: false,
			privateEvents: false,
			rentalInfo: undefined,
		});
		expect(fallback.hours).toEqual({
			monday: "Geschlossen",
			tuesday: "Geschlossen",
			wednesday: "Geschlossen",
			thursday: "Geschlossen",
			friday: "Geschlossen",
			saturday: "Geschlossen",
			sunday: "Geschlossen",
		});
		expect(fallback.verification).toEqual({
			isVerified: false,
		});
		expect(fallback.timestamps).toEqual({
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		});
	});

	it("should use basic data when provided", () => {
		const basicOrganizer = {
			id: 42,
			organizer: "Test Organizer",
			slug: "test-organizer",
			website: "https://test.com",
			email: "test@test.com",
			phone: "+49 123456789",
			description: "Test description",
			image: "https://test.com/image.jpg",
		};

		const fallback =
			FallbackDataGenerator.generateFallbackOrganizer(basicOrganizer);

		expect(fallback.id).toBe(42);
		expect(fallback.organizer).toBe("Test Organizer");
		expect(fallback.slug).toBe("test-organizer");
		expect(fallback.website).toBe("https://test.com");
		expect(fallback.email).toBe("test@test.com");
		expect(fallback.phone).toBe("+49 123456789");
		expect(fallback.description).toBe("Test description");
		expect(fallback.image).toBe("https://test.com/image.jpg");
	});

	it("should use basic venue data when provided", () => {
		const basicVenue = {
			id: 42,
			venue: "Test Venue",
			address: "Test Street 1",
			city: "Test City",
			geo_lat: 49.0123,
			geo_lng: 8.1234,
			website: "https://test-venue.com",
		};

		const fallback = FallbackDataGenerator.generateFallbackVenue(basicVenue);

		expect(fallback.id).toBe(42);
		expect(fallback.venue).toBe("Test Venue");
		expect(fallback.address).toBe("Test Street 1");
		expect(fallback.city).toBe("Test City");
		expect(fallback.geo_lat).toBe(49.0123);
		expect(fallback.geo_lng).toBe(8.1234);
		expect(fallback.website).toBe("https://test-venue.com");
	});
});
