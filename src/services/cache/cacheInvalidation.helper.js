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
