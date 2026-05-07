const { getCache, setCache } = require("./cache.service");

const { parseTTL } = require("./parseTTL.util");

exports.cacheOrFetch = async (key, fetchFn, ttl = process.env.CACHE_TTL) => {
  const cached = await getCache(key);

  if (cached) {
    return cached;
  }

  const data = await fetchFn();

  await setCache(key, data, parseTTL(ttl));

  return data;
};
