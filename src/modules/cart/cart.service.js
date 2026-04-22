const cartRepository = require("./cart.repository");
const productsRepository = require("../products/products.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const CartStatus = require("../../enums/cartStatus.enum");

exports.getCart = async (userId) => {
  const cart = await cartRepository.getCartWithItems(userId);

  if (!cart) {
    return {
      status: CartStatus.ACTIVE,
      items: [],
    };
  }

  return {
    cartId: cart.id,
    status: cart.status,
    items: cart.items.map((item) => ({
      quantity: item.quantity,
      added_at: item.added_at,
      product: item.product,
    })),
  };
};

exports.addToCart = async (userId, productId, quantity = 1) => {
  const product = await productsRepository.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", HttpStatus.NotFound);
  }

  // 1. get or create cart
  let cart = await cartRepository.findActiveCartByUser(userId);
  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  // 2. check if item exists
  const existingItem = await cartRepository.findCartItem(cart.id, productId);

  // 3. decide (add or update)
  // 4. call repository
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    await cartRepository.updateCartItem(cart.id, productId, newQuantity);
  } else {
    await cartRepository.addCartItem(cart.id, productId, quantity);
  }

  return { success: true };
};

exports.updateCartItem = async (userId, productId, quantity) => {
  const cart = await cartRepository.findActiveCartByUser(userId);
  if (!cart) {
    throw new ApiError("Cart not found", HttpStatus.NotFound);
  }

  const existingItem = await cartRepository.findCartItem(cart.id, productId);
  if (!existingItem) {
    throw new ApiError("Product not found in cart", HttpStatus.NotFound);
  }

  if (quantity === 0) {
    await cartRepository.deleteCartItem(cart.id, productId);
  } else {
    await cartRepository.updateCartItem(cart.id, productId, quantity);
  }

  return { success: true };
};

exports.deleteFromCart = async (userId, productId) => {
  const cart = await cartRepository.findActiveCartByUser(userId);
  if (!cart) {
    throw new ApiError("Cart not found", HttpStatus.NotFound);
  }

  const existingItem = await cartRepository.findCartItem(cart.id, productId);
  if (!existingItem) {
    throw new ApiError("Product not found in cart", HttpStatus.NotFound);
  }

  await cartRepository.deleteCartItem(cart.id, productId);

  return { success: true };
};
