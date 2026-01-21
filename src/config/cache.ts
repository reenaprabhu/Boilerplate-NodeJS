import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let redisEnabled = true;
let connectionAttempted = false;

/**
 * Check if Redis is enabled
 */
export function isRedisEnabled(): boolean {
  return redisEnabled && process.env.USE_REDIS !== 'false';
}

/**
 * Get or create Redis client with connection pooling
 * Redis automatically handles connection pooling
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!isRedisEnabled()) {
    return null;
  }

  if (!redisClient && !connectionAttempted) {
    connectionAttempted = true;
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              // After 3 retries, disable Redis silently
              redisEnabled = false;
              console.warn('⚠️  Redis connection failed. Caching disabled. Set USE_REDIS=false to suppress this warning.');
              return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 1000);
          },
          connectTimeout: 2000, // 2 second timeout
        },
      });

      // Only log errors once, not on every retry
      let errorLogged = false;
      redisClient.on('error', (err) => {
        if (!errorLogged) {
          errorLogged = true;
          console.warn('⚠️  Redis connection error. Caching will be disabled.');
        }
      });
      
      redisClient.on('connect', () => {
        console.log('✅ Redis Client Connected');
        redisEnabled = true;
      });

      await redisClient.connect();
    } catch (error) {
      // Connection failed, disable Redis
      redisEnabled = false;
      redisClient = null;
      console.warn('⚠️  Redis not available. Application will run without caching.');
      return null;
    }
  }

  // Check if client is still connected
  if (redisClient && !redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch {
      redisEnabled = false;
      redisClient = null;
      return null;
    }
  }

  return redisClient;
}

/**
 * Cache helper functions for cache-aside pattern
 */
export class CacheService {
  private client: RedisClientType | null = null;
  private defaultTTL = 3600; // 1 hour default TTL

  async getClient(): Promise<RedisClientType | null> {
    if (!isRedisEnabled()) {
      return null;
    }
    
    if (!this.client) {
      this.client = await getRedisClient();
    }
    
    // Check if client is still valid
    if (this.client && !this.client.isOpen) {
      this.client = null;
      return null;
    }
    
    return this.client;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!isRedisEnabled()) {
      return null; // Cache disabled, return null to fetch from DB
    }

    try {
      const client = await this.getClient();
      if (!client) {
        return null; // No Redis client available
      }
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // Fail gracefully - return null so app can fetch from DB
      // Don't log errors for normal cache misses or when Redis is unavailable
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!isRedisEnabled()) {
      return; // Cache disabled, skip
    }

    try {
      const client = await this.getClient();
      if (!client) {
        return; // No Redis client available
      }
      await client.setEx(key, ttl || this.defaultTTL, JSON.stringify(value));
    } catch (error) {
      // Fail silently - caching is optional
      // Don't log errors when Redis is unavailable
    }
  }

  /**
   * Delete key from cache (for invalidation)
   */
  async delete(key: string): Promise<void> {
    if (!isRedisEnabled()) {
      return; // Cache disabled, skip
    }

    try {
      const client = await this.getClient();
      if (!client) {
        return; // No Redis client available
      }
      await client.del(key);
    } catch (error) {
      // Fail silently - cache invalidation is optional
    }
  }

  /**
   * Delete multiple keys matching pattern (for cache invalidation)
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!isRedisEnabled()) {
      return; // Cache disabled, skip
    }

    try {
      const client = await this.getClient();
      if (!client) {
        return; // No Redis client available
      }
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      // Fail silently - cache invalidation is optional
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        // Ignore errors on disconnect
      }
      this.client = null;
    }
  }
}

export const cacheService = new CacheService();
