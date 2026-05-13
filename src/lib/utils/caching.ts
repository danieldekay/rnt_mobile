/**
 * Caching strategy for enhanced organizer and venue data
 */

import type { EnhancedOrganizer, EnhancedVenue } from "$lib/types";

// Cache configuration
export interface CacheConfig {
	enabled: boolean;
	ttl: number; // Time to live in milliseconds
	maxSize: number; // Maximum number of cached items
	cleanupInterval: number; // Cleanup interval in milliseconds
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
	enabled: true,
	ttl: 30 * 60 * 1000, // 30 minutes
	maxSize: 1000,
	cleanupInterval: 5 * 60 * 1000, // 5 minutes
};

// Cache entry interface
export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	accessCount: number;
	lastAccessed: number;
	key: string;
}

// Cache manager class
export class CacheManager<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private config: CacheConfig;
	private cleanupTimer: NodeJS.Timeout | null = null;

	constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
		this.config = config;
		this.startCleanupTimer();
	}

	/**
	 * Get item from cache
	 */
	public get(key: string): T | null {
		if (!this.config.enabled) return null;

		const entry = this.cache.get(key);
		if (!entry) return null;

		const now = Date.now();

		// Check if expired
		if (now - entry.timestamp > this.config.ttl) {
			this.cache.delete(key);
			return null;
		}

		// Update access statistics
		entry.accessCount++;
		entry.lastAccessed = now;

		return entry.data;
	}

	/**
	 * Set item in cache
	 */
	public set(key: string, data: T): void {
		if (!this.config.enabled) return;

		const now = Date.now();

		// Check if we need to evict items (LRU strategy)
		if (this.cache.size >= this.config.maxSize) {
			this.evictLRU();
		}

		// Create new entry
		const entry: CacheEntry<T> = {
			data,
			timestamp: now,
			accessCount: 1,
			lastAccessed: now,
			key,
		};

		this.cache.set(key, entry);
	}

	/**
	 * Delete item from cache
	 */
	public delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all cache
	 */
	public clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	public getStats() {
		const now = Date.now();
		let totalAccessCount = 0;
		let expiredCount = 0;

		for (const entry of this.cache.values()) {
			totalAccessCount += entry.accessCount;
			if (now - entry.timestamp > this.config.ttl) {
				expiredCount++;
			}
		}

		return {
			totalItems: this.cache.size,
			totalAccessCount,
			expiredCount,
			hitRate: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
			oldestEntry: this.getOldestEntry(),
			newestEntry: this.getNewestEntry(),
		};
	}

	/**
	 * Cleanup expired entries
	 */
	public cleanup(): void {
		const now = Date.now();
		const keysToDelete: string[] = [];

		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.config.ttl) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.cache.delete(key));
	}

	/**
	 * Stop cleanup timer
	 */
	public destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}
	}

	/**
	 * Get oldest entry
	 */
	private getOldestEntry(): CacheEntry<T> | null {
		let oldest: CacheEntry<T> | null = null;
		let oldestTime = Infinity;

		for (const entry of this.cache.values()) {
			if (entry.timestamp < oldestTime) {
				oldest = entry;
				oldestTime = entry.timestamp;
			}
		}

		return oldest;
	}

	/**
	 * Get newest entry
	 */
	private getNewestEntry(): CacheEntry<T> | null {
		let newest: CacheEntry<T> | null = null;
		let newestTime = -Infinity;

		for (const entry of this.cache.values()) {
			if (entry.timestamp > newestTime) {
				newest = entry;
				newestTime = entry.timestamp;
			}
		}

		return newest;
	}

	/**
	 * Evict least recently used item
	 */
	private evictLRU(): void {
		let lruKey: string | null = null;
		let lruTime = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.lastAccessed < lruTime) {
				lruKey = key;
				lruTime = entry.lastAccessed;
			}
		}

		if (lruKey) {
			this.cache.delete(lruKey);
		}
	}

	/**
	 * Start cleanup timer
	 */
	private startCleanupTimer(): void {
		if (this.config.enabled && this.config.cleanupInterval > 0) {
			this.cleanupTimer = setInterval(() => {
				this.cleanup();
			}, this.config.cleanupInterval);
		}
	}
}

// Cache instances
export const organizerCache = new CacheManager<EnhancedOrganizer>();
export const venueCache = new CacheManager<EnhancedVenue>();

// Cache key generators
export function generateOrganizerKey(id: number): string {
	return `organizer:${id}`;
}

export function generateVenueKey(id: number): string {
	return `venue:${id}`;
}

export function generateOrganizersKey(): string {
	return "organizers:all";
}

export function generateVenuesKey(): string {
	return "venues:all";
}

// Cache utilities
export class CacheUtils {
	/**
	 * Get organizer from cache or fetch if not available
	 */
	static async getOrganizer(
		id: number,
		fetchFn: () => Promise<EnhancedOrganizer>,
	): Promise<EnhancedOrganizer> {
		const cacheKey = generateOrganizerKey(id);
		const cached = organizerCache.get(cacheKey);

		if (cached) {
			return cached;
		}

		try {
			const data = await fetchFn();
			organizerCache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Failed to fetch organizer ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Get venue from cache or fetch if not available
	 */
	static async getVenue(
		id: number,
		fetchFn: () => Promise<EnhancedVenue>,
	): Promise<EnhancedVenue> {
		const cacheKey = generateVenueKey(id);
		const cached = venueCache.get(cacheKey);

		if (cached) {
			return cached;
		}

		try {
			const data = await fetchFn();
			venueCache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Failed to fetch venue ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Get multiple organizers from cache or fetch if not available
	 */
	static async getOrganizers(
		ids: number[],
		fetchFn: () => Promise<EnhancedOrganizer[]>,
	): Promise<EnhancedOrganizer[]> {
		const uncachedIds: number[] = [];
		const result: EnhancedOrganizer[] = [];

		// Check cache for each organizer
		for (const id of ids) {
			const cacheKey = generateOrganizerKey(id);
			const cached = organizerCache.get(cacheKey);

			if (cached) {
				result.push(cached);
			} else {
				uncachedIds.push(id);
			}
		}

		// Fetch uncached organizers
		if (uncachedIds.length > 0) {
			try {
				const fetchedOrganizers = await fetchFn();

				// Cache and add to result
				for (const organizer of fetchedOrganizers) {
					const cacheKey = generateOrganizerKey(organizer.id);
					organizerCache.set(cacheKey, organizer);
					result.push(organizer);
				}
			} catch (error) {
				console.error(`Failed to fetch organizers:`, error);
				throw error;
			}
		}

		return result;
	}

	/**
	 * Get multiple venues from cache or fetch if not available
	 */
	static async getVenues(
		ids: number[],
		fetchFn: () => Promise<EnhancedVenue[]>,
	): Promise<EnhancedVenue[]> {
		const uncachedIds: number[] = [];
		const result: EnhancedVenue[] = [];

		// Check cache for each venue
		for (const id of ids) {
			const cacheKey = generateVenueKey(id);
			const cached = venueCache.get(cacheKey);

			if (cached) {
				result.push(cached);
			} else {
				uncachedIds.push(id);
			}
		}

		// Fetch uncached venues
		if (uncachedIds.length > 0) {
			try {
				const fetchedVenues = await fetchFn();

				// Cache and add to result
				for (const venue of fetchedVenues) {
					const cacheKey = generateVenueKey(venue.id);
					venueCache.set(cacheKey, venue);
					result.push(venue);
				}
			} catch (error) {
				console.error(`Failed to fetch venues:`, error);
				throw error;
			}
		}

		return result;
	}

	/**
	 * Invalidate organizer cache
	 */
	static invalidateOrganizer(id?: number): void {
		if (id) {
			const cacheKey = generateOrganizerKey(id);
			organizerCache.delete(cacheKey);
		} else {
			organizerCache.clear();
		}
	}

	/**
	 * Invalidate venue cache
	 */
	static invalidateVenue(id?: number): void {
		if (id) {
			const cacheKey = generateVenueKey(id);
			venueCache.delete(cacheKey);
		} else {
			venueCache.clear();
		}
	}

	/**
	 * Get cache statistics
	 */
	static getStats() {
		return {
			organizers: organizerCache.getStats(),
			venues: venueCache.getStats(),
		};
	}

	/**
	 * Clear all caches
	 */
	static clearAll(): void {
		organizerCache.clear();
		venueCache.clear();
	}

	/**
	 * Force cleanup of expired entries
	 */
	static cleanup(): void {
		organizerCache.cleanup();
		venueCache.cleanup();
	}
}

// Cache middleware for Svelte stores
export function createCachedStore<T>(
	store: { subscribe: (callback: (value: T) => void) => void },
	cacheKey: string,
	cacheManager: CacheManager<T>,
) {
	let cachedValue: T | null = null;
	let lastCacheTime = 0;
	const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	return {
		subscribe: (run: (value: T) => void) => {
			return store.subscribe((value: T) => {
				const now = Date.now();

				// Check if we should update cache
				if (!cachedValue || now - lastCacheTime > CACHE_TTL) {
					cachedValue = value;
					lastCacheTime = now;
					cacheManager.set(cacheKey, value);
				}

				run(value);
			});
		},

		getCached: (): T | null => {
			return cacheManager.get(cacheKey);
		},

		invalidate: (): void => {
			cacheManager.delete(cacheKey);
			cachedValue = null;
			lastCacheTime = 0;
		},
	};
}

// Service worker cache utilities for PWA
export class SWCacheUtils {
	/**
	 * Cache organizer data in service worker
	 */
	static async cacheOrganizer(
		id: number,
		data: EnhancedOrganizer,
	): Promise<void> {
		if ("caches" in window) {
			const cache = await caches.open("organizers");
			const key = generateOrganizerKey(id);
			await cache.put(key, new Response(JSON.stringify(data)));
		}
	}

	/**
	 * Cache venue data in service worker
	 */
	static async cacheVenue(id: number, data: EnhancedVenue): Promise<void> {
		if ("caches" in window) {
			const cache = await caches.open("venues");
			const key = generateVenueKey(id);
			await cache.put(key, new Response(JSON.stringify(data)));
		}
	}

	/**
	 * Get cached organizer from service worker
	 */
	static async getCachedOrganizer(
		id: number,
	): Promise<EnhancedOrganizer | null> {
		if ("caches" in window) {
			const cache = await caches.open("organizers");
			const key = generateOrganizerKey(id);
			const response = await cache.match(key);

			if (response) {
				return await response.json();
			}
		}
		return null;
	}

	/**
	 * Get cached venue from service worker
	 */
	static async getCachedVenue(id: number): Promise<EnhancedVenue | null> {
		if ("caches" in window) {
			const cache = await caches.open("venues");
			const key = generateVenueKey(id);
			const response = await cache.match(key);

			if (response) {
				return await response.json();
			}
		}
		return null;
	}

	/**
	 * Clear service worker cache
	 */
	static async clearCache(): Promise<void> {
		if ("caches" in window) {
			await caches.delete("organizers");
			await caches.delete("venues");
		}
	}
}
