const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Payment = require("./payment.model");
const Shipping = require("./shipping.model");
const { Product, ProductImage } = require("../products/products.model");
const Category = require("../categories/categories.model");
const { Cart } = require("../cart/cart.model");
const sequelize = require("../../config/sequelize");
const SellerProfile = require("../sellers/sellers.model");

// Setup Associations
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Order.hasOne(Payment, { foreignKey: "order_id", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

Order.hasOne(Shipping, { foreignKey: "order_id", as: "shipping" });
Shipping.belongsTo(Order, { foreignKey: "order_id" });

OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

exports.processCheckout = async (cartId, orderData) => {
  return await sequelize.transaction(async (t) => {
    // 1. Create order and related records
    const order = await Order.create(orderData, {
      transaction: t,
      include: [
        { model: OrderItem, as: "items" },
        { model: Payment, as: "payment" },
        { model: Shipping, as: "shipping" },
      ],
    });

    // 2. Mark cart as ordered
    await Cart.update(
      { status: "ORDERED" },
      { where: { id: cartId }, transaction: t },
    );

    return order;
  });
};

exports.findOrderById = async (id) => {
  return await Order.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            include: [{ model: ProductImage, as: "images" }],
          },
        ],
      },
      { model: Payment, as: "payment" },
      { model: Shipping, as: "shipping" },
    ],
  });
};

exports.findUserOrders = async (userId, filters) => {
  const query = {
    where: { user_id: userId, ...(filters?.parsedFilters || {}) },
    limit: filters?.parsedPagination?.limit,
    offset: filters?.parsedPagination?.offset,
    order: filters?.parsedSort,
    distinct: true,
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            include: [{ model: ProductImage, as: "images" }],
          },
        ],
      },
      { model: Payment, as: "payment" },
      { model: Shipping, as: "shipping" },
    ],
  };

  const { count, rows } = await Order.findAndCountAll(query);
  return { count, rows };
};

exports.findSellerOrders = async (userId, filters) => {
  const limit = filters?.parsedPagination?.limit || 10;
  const offset = filters?.parsedPagination?.offset || 0;

  const sellerProfile = await SellerProfile.findOne({
    where: { user_id: userId },
    attributes: ["id"],
  });

  if (!sellerProfile) {
    return {
      total: 0,
      page: 1,
      limit,
      data: [],
    };
  }

  const query = {
    where: { ...(filters?.parsedFilters || {}) },

    limit,
    offset,

    order: filters?.parsedSort || [["created_at", "DESC"]],

    distinct: true,
    subQuery: false,

    include: [
      {
        model: OrderItem,
        as: "items",
        required: true,
        include: [
          {
            model: Product,
            as: "product",
            required: true,
            where: { seller_id: sellerProfile.id },
          },
        ],
      },
      {
        model: Payment,
        as: "payment",
        required: false,
      },
      {
        model: Shipping,
        as: "shipping",
        required: false,
      },
    ],
  };

  const result = await Order.findAndCountAll(query);

  return {
    total: result.count,
    page: Math.floor(offset / limit) + 1,
    limit,
    data: result.rows,
  };
};

exports.updateOrderStatus = async (id, status) => {
  await Order.update({ status }, { where: { id } });

  const updateShippingPayload = { status };
  if (status === "DELIVERED") updateShippingPayload.delivered_at = new Date();
  if (status === "CANCELED") updateShippingPayload.canceled_at = new Date();

  await Shipping.update(updateShippingPayload, { where: { order_id: id } });
};

exports.cancelOrder = async (id) => {
  await Order.update({ status: "CANCELED" }, { where: { id } });
  await Shipping.update(
    { status: "CANCELED", canceled_at: new Date() },
    { where: { order_id: id } },
  );
  await Payment.update(
    { status: "FAILED" },
    { where: { order_id: id, status: "PENDING" } },
  );
};
