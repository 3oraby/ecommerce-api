const Review = require("./review.model");
const { Product } = require("../products/products.model");
const Order = require("../orders/order.model");
const OrderItem = require("../orders/orderItem.model");
const OrderStatus = require("../../enums/orderStatus.enum");

exports.findProductById = async (productId) => {
  return await Product.findByPk(productId);
};

exports.checkUserDeliveredOrder = async (userId, productId) => {
  const order = await Order.findOne({
    where: {
      user_id: userId,
      status: OrderStatus.DELIVERED,
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        required: true,
        where: { product_id: productId },
      },
    ],
  });

  return !!order;
};

exports.findReviewByUserAndProduct = async (userId, productId) => {
  return await Review.findOne({
    where: { user_id: userId, product_id: productId },
  });
};

exports.createReview = async (data) => {
  return await Review.create(data);
};

exports.updateReview = async (userId, productId, data) => {
  await Review.update(data, {
    where: {
      user_id: userId,
      product_id: productId,
    },
  });
};

exports.deleteReview = async (userId, productId) => {
  await Review.destroy({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });
};

exports.findProductReviews = async (productId, filters) => {
  const limit = filters?.parsedPagination?.limit || 10;
  const offset = filters?.parsedPagination?.offset || 0;

  const { count, rows } = await Review.findAndCountAll({
    where: {
      product_id: productId,
      ...(filters?.parsedFilters || {}),
    },
    limit,
    offset,
    order: filters?.parsedSort || [["created_at", "DESC"]],
    distinct: true,
  });

  return {
    total: count,
    page: Math.floor(offset / limit) + 1,
    limit,
    averageRating: rows.reduce((acc, review) => acc + review.rating, 0) / count,
    reviews: rows,
  };
};
