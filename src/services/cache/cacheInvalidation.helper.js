const patterns = require("./cachePatterns.util");
const { deleteByPattern, deleteCache } = require("./cache.service");

exports.invalidateProductCaches = async ({ productId } = {}) => {
  const promises = [
    deleteByPattern(patterns.products.all),
    deleteCache(patterns.home.all),
  ];

  if (productId) {
    promises.push(deleteCache(patterns.product.this(productId)));
  }

  await Promise.all(promises);
};

exports.invalidatePaymentMethodsCache = async () => {
  await deleteByPattern(patterns.paymentMethods.all);
};

exports.invalidateNotificationsCache = async (userId) => {
  await Promise.all([
    deleteByPattern(patterns.notifications.all(userId)),
    deleteCache(patterns.notifications.unreadCount(userId))
  ]);
};

exports.invalidateFavoritesCache = async (userId) => {
  await deleteByPattern(patterns.favorites.user(userId));
};

exports.invalidateCartCache = async (userId) => {
  await deleteCache(patterns.cart.user(userId));
};

exports.invalidateOrdersCache = async (userId) => {
  await deleteByPattern(patterns.orders.user(userId));
};

exports.invalidateReviewsCache = async (userId, productId) => {
  const promises = [];
  if (userId) promises.push(deleteByPattern(patterns.reviews.user(userId)));
  if (productId) promises.push(deleteByPattern(patterns.reviews.product(productId)));
  if (productId) promises.push(exports.invalidateProductCaches({ productId }));
  
  await Promise.all(promises);
};

exports.invalidateAddressesCache = async (userId) => {
  await deleteCache(patterns.addresses.user(userId));
};

exports.invalidateCategoriesCache = async ({categoryId} = {}) => {
  const promises = [
    deleteByPattern(patterns.categories.all),
  ];

  if (categoryId) {
    promises.push(deleteCache(patterns.category.this(categoryId)));
  }

  await Promise.all(promises);
};