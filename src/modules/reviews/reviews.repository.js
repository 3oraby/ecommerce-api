const { Op, fn, col } = require("sequelize");
const sequelize = require("../../config/sequelize");

const Review = require("./review.model");
const { Product } = require("../products/products.model");
const Order = require("../orders/order.model");
const OrderItem = require("../orders/orderItem.model");

const OrderStatus = require("../../enums/orderStatus.enum");

const calculateAverageRating = async (productId, transaction = null) => {
  const result = await Review.findOne({
    where: { product_id: productId },
    attributes: [[fn("AVG", col("rating")), "avgRating"]],
    raw: true,
    transaction,
  });

  return parseFloat(result?.avgRating) || 0;
};

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
  return await sequelize.transaction(async (t) => {
    const review = await Review.create(data, { transaction: t });
    const avgRating = await calculateAverageRating(data.product_id, t);

    await Product.update(
      { rating: avgRating },
      {
        where: { id: data.product_id },
        transaction: t,
      },
    );

    return review;
  });
};

exports.updateReview = async (userId, productId, data) => {
  return await sequelize.transaction(async (t) => {
    await Review.update(data, {
      where: {
        user_id: userId,
        product_id: productId,
      },
      transaction: t,
    });

    const avgRating = await calculateAverageRating(productId, t);

    await Product.update(
      { rating: avgRating },
      {
        where: { id: productId },
        transaction: t,
      },
    );

    return await Review.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
      transaction: t,
    });
  });
};

exports.deleteReview = async (userId, productId) => {
  return await sequelize.transaction(async (t) => {
    await Review.destroy({
      where: {
        user_id: userId,
        product_id: productId,
      },
      transaction: t,
    });

    const avgRating = await calculateAverageRating(productId, t);

    await Product.update(
      { rating: avgRating },
      {
        where: { id: productId },
        transaction: t,
      },
    );
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

  const avgResult = await Review.findOne({
    where: { product_id: productId },
    attributes: [[fn("AVG", col("rating")), "avgRating"]],
    raw: true,
  });

  return {
    total: count,
    page: Math.floor(offset / limit) + 1,
    limit,
    averageRating: parseFloat(avgResult?.avgRating) || 0,
    reviews: rows,
  };
};
