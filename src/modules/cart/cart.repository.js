const { Cart, CartItem } = require("./cart.model");
const { Product, ProductCategory, ProductImage } = require("../products/products.model");
const Category = require("../categories/categories.model");
const CartStatus = require("../../enums/cartStatus.enum");

exports.findActiveCartByUser = async (userId) => {
  return await Cart.findOne({
    where: { user_id: userId, status: CartStatus.ACTIVE },
  });
};

exports.createCart = async (userId) => {
  return await Cart.create({
    user_id: userId,
    status: CartStatus.ACTIVE,
  });
};

exports.findCartItem = async (cartId, productId) => {
  return await CartItem.findOne({
    where: { cart_id: cartId, product_id: productId },
  });
};

exports.addCartItem = async (cartId, productId, quantity) => {
  return await CartItem.create({
    cart_id: cartId,
    product_id: productId,
    quantity,
  });
};

exports.updateCartItem = async (cartId, productId, quantity) => {
  await CartItem.update(
    { quantity },
    { where: { cart_id: cartId, product_id: productId } }
  );
};

exports.deleteCartItem = async (cartId, productId) => {
  await CartItem.destroy({
    where: { cart_id: cartId, product_id: productId },
  });
};

exports.getCartWithItems = async (userId, limit, offset, order) => {
  const query = {
    where: { user_id: userId, status: CartStatus.ACTIVE },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            include: [
              {
                model: Category,
                as: "categories",
                attributes: ["id", "name"],
                through: { attributes: [] },
              },
              {
                model: ProductImage,
                as: "images",
                attributes: ["id", "image_url"],
              },
            ],
          },
        ],
      },
    ],
  };

  if (limit) query.limit = limit;
  if (offset) query.offset = offset;
  if (order) query.order = order;

  return await Cart.findOne(query);
};
