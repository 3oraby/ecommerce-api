const { getCache, setCache } = require("./cache.service");
const { parseTTL } = require("./parseTTL.util");
const { formatPaginatedResponse } = require("../../utils/pagination.util");

exports.cacheOrFetch = async (key, fetchFn, ttl = process.env.CACHE_TTL) => {
  const cached = await getCache(key);

  if (cached) {
    return cached;
  }

  const data = await fetchFn();

  await setCache(key, data, parseTTL(ttl));

  return data;
};

exports.cacheableList = async ({
  cacheKey,
  repositoryCall,
  queryBuilderResult,
  ttl = process.env.CACHE_TTL,
}) => {
  return exports.cacheOrFetch(cacheKey, async () => {
    const result = await repositoryCall();

    const totalItems = result.count || 0;
    const data = result.rows || [];

    const page = queryBuilderResult?.pagination?.page || 1;
    const limit = queryBuilderResult?.pagination?.limit || 10;

    return formatPaginatedResponse({ totalItems, page, limit, data });
  }, ttl);
};
