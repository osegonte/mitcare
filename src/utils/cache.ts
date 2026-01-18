// src/utils/cache.ts

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set cached data with TTL (default 5 minutes)
   */
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Helper functions for common cache keys
export const CACHE_KEYS = {
  providerSearch: (location: string, services: string) => 
    `providers_search_${location}_${services}`,
  providerDetail: (id: string) => 
    `provider_detail_${id}`,
  userBookings: (userId: string) => 
    `user_bookings_${userId}`,
  providerBookings: (providerId: string) => 
    `provider_bookings_${providerId}`,
};