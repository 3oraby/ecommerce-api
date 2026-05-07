const buildQueryKey = (query = {}) => {
  return Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        value = value.flat().join("_");
      }

      return `${key}=${value}`;
    })
    .join(":");
};

const cacheKeyBuilder = {
  product: (id) => `product:${id}`,

  products: (query = {}) => `products:${buildQueryKey(query)}`,

  categoryProducts: (id, query = {}) =>
    `products:category:${id}:${buildQueryKey(query)}`,

  sellerProducts: (id, query = {}) =>
    `products:seller:${id}:${buildQueryKey(query)}`,

  homeData: () => "home",
};

module.exports = cacheKeyBuilder;
