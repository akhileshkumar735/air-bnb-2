const { createClient } = require("redis");
const NodeCache = require("node-cache");

let redisClient = null;
let useRedis = false;
let localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const initCache = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("Redis configuration missing. Falling back to local NodeCache.");
    return;
  }

  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err) => {
      console.warn("Redis client error, falling back to local NodeCache:", err.message);
      useRedis = false;
    });

    await redisClient.connect();
    console.log("Successfully connected to Redis server at:", redisUrl);
    useRedis = true;
  } catch (err) {
    console.warn("Could not connect to Redis server, using local NodeCache:", err.message);
    useRedis = false;
  }
};

initCache();

module.exports = {
  // Get item from cache
  getCache: async (key) => {
    try {
      if (useRedis && redisClient && redisClient.isOpen) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      }
    } catch (e) {
      console.warn("Redis get error:", e.message);
    }
    const val = localCache.get(key);
    return val ? val : null;
  },

  // Set item in cache with TTL in seconds
  setCache: async (key, data, ttl = 300) => {
    try {
      if (useRedis && redisClient && redisClient.isOpen) {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
        return true;
      }
    } catch (e) {
      console.warn("Redis set error:", e.message);
    }
    localCache.set(key, data, ttl);
    return true;
  },

  // Delete a specific key from cache
  delCache: async (key) => {
    try {
      if (useRedis && redisClient && redisClient.isOpen) {
        await redisClient.del(key);
        return true;
      }
    } catch (e) {
      console.warn("Redis del error:", e.message);
    }
    localCache.del(key);
    return true;
  },

  // Delete keys matching a wildcard pattern (e.g. "listings:*")
  delPattern: async (pattern) => {
    try {
      if (useRedis && redisClient && redisClient.isOpen) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        return true;
      }
    } catch (e) {
      console.warn("Redis pattern delete error:", e.message);
    }

    // NodeCache fallback pattern delete
    const cacheKeys = localCache.keys();
    const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const keysToDelete = cacheKeys.filter(k => regexPattern.test(k));
    
    if (keysToDelete.length > 0) {
      localCache.del(keysToDelete);
    }
    return true;
  }
};
