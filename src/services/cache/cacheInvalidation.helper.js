const patterns = require("./cachePatterns.util");
const { deleteByPattern } = require("./cache.service");

exports.invalidateAllProductCaches = async ({
  productId,
  sellerId,
  categoryIds = [],
}) => {
  const promises = [
    deleteByPattern(patterns.product.all),
    deleteByPattern(patterns.products.all),
    deleteByPattern(patterns.home.all),
  ];

  if (sellerId) {
    promises.push(deleteByPattern(patterns.products.seller(sellerId)));
  }

  categoryIds.forEach((id) => {
    promises.push(deleteByPattern(patterns.products.category(id)));
  });

  await Promise.all(promises);
};
