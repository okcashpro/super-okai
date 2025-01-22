interface CacheOptions {
  maxAge?: number; // milliseconds
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  maxAge?: number;
}

class Cache {
  private static instance: Cache;
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: number;

  private constructor() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): Cache {
    if (!this.instance) {
      this.instance = new Cache();
    }
    return this.instance;
  }

  set<T>(key: string, value: T, options: CacheOptions = {}) {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      maxAge: options.maxAge
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T>;
    
    if (!entry) return null;

    if (entry.maxAge && Date.now() - entry.timestamp > entry.maxAge) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (entry.maxAge && Date.now() - entry.timestamp > entry.maxAge) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.maxAge && now - entry.timestamp > entry.maxAge) {
        this.store.delete(key);
      }
    }
  }

  // Cleanup interval when shutting down
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        expires: entry.maxAge ? entry.timestamp + entry.maxAge : null
      }))
    };
  }
}

export const cache = Cache.getInstance();