interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in seconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface StoredLimits {
  [key: string]: RateLimitEntry;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry> = new Map();
  private storageKey = 'super_okai_rate_limits';
  
  private constructor(private config: RateLimitConfig) {
    this.loadLimits();
    // Periodically save limits
    setInterval(() => this.saveLimits(), 30000);
    // Clean expired limits
    setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(config: RateLimitConfig = { maxRequests: 50, timeWindow: 3600 }): RateLimiter {
    if (!this.instance) {
      this.instance = new RateLimiter(config);
    }
    return this.instance;
  }

  private loadLimits(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const limits: StoredLimits = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired limits
        Object.entries(limits).forEach(([key, entry]) => {
          if (entry.resetTime > now) {
            this.limits.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.error('Error loading rate limits:', error);
    }
  }

  private saveLimits(): void {
    try {
      const limits: StoredLimits = {};
      this.limits.forEach((entry, key) => {
        limits[key] = entry;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(limits));
    } catch (error) {
      console.error('Error saving rate limits:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
    this.saveLimits();
  }

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now >= entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + (this.config.timeWindow * 1000)
      });
      this.saveLimits();
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    this.saveLimits();
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return this.config.maxRequests;
    }
    return this.config.maxRequests - entry.count;
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return 0;
    }
    return entry.resetTime;
  }

  clearLimit(identifier: string) {
    this.limits.delete(identifier);
    this.saveLimits();
  }

  clearAllLimits() {
    this.limits.clear();
    localStorage.removeItem(this.storageKey);
  }

  getLimitStats() {
    const now = Date.now();
    return {
      activeLimits: this.limits.size,
      limits: Array.from(this.limits.entries()).map(([key, entry]) => ({
        identifier: key,
        remaining: this.config.maxRequests - entry.count,
        resetsIn: Math.max(0, entry.resetTime - now) / 1000
      }))
    };
  }
}