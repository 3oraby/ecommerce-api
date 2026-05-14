module.exports = {
  product: {
    all: "product:*",
    this(id) {
      return `product:${id}`;
    },
  },
  products: {
    all: "products:*",
    seller(id) {
      return `products:seller:${id}:*`;
    },
  },
  home: { all: "home" },
  paymentMethods: {
    all: "payment:methods*",
  },
};
