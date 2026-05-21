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

  sellerProducts: (id, query = {}) =>
    `products:seller:${id}:${buildQueryKey(query)}`,

  homeData: () => "home",

  paymentMethods: () => "payment:methods",

  category: (id) => `category:${id}`,
  
  categories: (query = {}) => `categories:${buildQueryKey(query)}`,

  notifications: (userId, query = {}) =>
    `notifications:${userId}:${buildQueryKey(query)}`,
    
  notificationUnreadCount: (userId) => `notifications:unread_count:${userId}`,

  favorites: (userId, query = {}) => `favorites:user:${userId}:${buildQueryKey(query)}`,

  cart: (userId) => `cart:user:${userId}`,

  orders: (userId, query = {}) => `orders:user:${userId}:${buildQueryKey(query)}`,

  reviewsUser: (userId, query = {}) => `reviews:user:${userId}:${buildQueryKey(query)}`,
  
  reviewsProduct: (productId, query = {}) => `reviews:product:${productId}:${buildQueryKey(query)}`,

  addresses: (userId) => `addresses:user:${userId}`,

  cities: () => `locations:cities`,

  states: () => `locations:states`,

  countries: () => `locations:countries`,
};

module.exports = cacheKeyBuilder;
