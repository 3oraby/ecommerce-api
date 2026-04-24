const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Payment = require("./payment.model");
const Shipping = require("./shipping.model");
const { Product, ProductImage } = require("../products/products.model");
const { Cart } = require("../cart/cart.model");
const sequelize = require("../../config/sequelize");
const SellerProfile = require("../sellers/sellers.model");
const OrderStatus = require("../../enums/orderStatus.enum");

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
    // Create order and related records
    const order = await Order.create(orderData, {
      transaction: t,
      include: [
        { model: OrderItem, as: "items" },
        { model: Payment, as: "payment" },
        { model: Shipping, as: "shipping" },
      ],
    });

    // Mark cart as ordered
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

  const data = result.rows.map((order) => {
    let sellerTotal = 0;

    order.items.forEach((item) => {
      sellerTotal += item.price * item.quantity;
    });

    delete order.dataValues.total;
    delete order.dataValues.payment;
    delete order.dataValues.shipping;

    return {
      seller_total: sellerTotal,
      ...order.toJSON(),
    };
  });

  return {
    total: result.count,
    page: Math.floor(offset / limit) + 1,
    limit,
    data,
  };
};

exports.updateOrderStatus = async (orderId, status) => {
  return await sequelize.transaction(async (t) => {
    const freshOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!freshOrder) {
      throw new Error("Order not found");
    }

    const wasDeliveredBefore = freshOrder.status === OrderStatus.DELIVERED;

    await freshOrder.update({ status }, { transaction: t });

    const shippingPayload = { status };

    if (status === OrderStatus.DELIVERED) {
      shippingPayload.delivered_at = new Date();
    }

    if (status === OrderStatus.CANCELED) {
      shippingPayload.canceled_at = new Date();
    }

    await Shipping.update(shippingPayload, {
      where: { order_id: freshOrder.id },
      transaction: t,
    });

    if (status === OrderStatus.DELIVERED) {
      await Payment.update(
        { status: "COMPLETED" },
        { where: { order_id: freshOrder.id }, transaction: t },
      );
    }

    if (status === OrderStatus.CANCELED) {
      await Payment.update(
        { status: "FAILED" },
        { where: { order_id: freshOrder.id }, transaction: t },
      );
    }

    if (status === OrderStatus.DELIVERED && !wasDeliveredBefore) {
      const productIds = freshOrder.items.map((i) => i.product_id);

      const products = await Product.findAll({
        where: { id: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of freshOrder.items) {
        const product = productMap.get(item.product_id);

        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }

        await product.decrement("stock", {
          by: item.quantity,
          transaction: t,
        });
      }
    }

    return true;
  });
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
