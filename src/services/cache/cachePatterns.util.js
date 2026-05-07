module.exports = {
  product: {
    all: "product:*",
  },

  products: {
    all: "products:*",
    category: (id) => `products:category:${id}:*`,
    seller: (id) => `products:seller:${id}:*`,
  },

  home: { all: "home" },
};
