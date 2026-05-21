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
  category: {
    this(id) {
      return `category:${id}`;
    }
  },
  categories: {
    all: "categories:*"
  },
  notifications: {
    all(userId) {
      return `notifications:${userId}:*`;
    },
    unreadCount(userId) {
      return `notifications:unread_count:${userId}`;
    }
  },
  favorites: {
    user(userId) {
      return `favorites:user:${userId}:*`;
    }
  },
  cart: {
    user(userId) {
      return `cart:user:${userId}`;
    }
  },
  orders: {
    user(userId) {
      return `orders:user:${userId}:*`;
    }
  },
  reviews: {
    user(userId) {
      return `reviews:user:${userId}:*`;
    },
    product(productId) {
      return `reviews:product:${productId}:*`;
    }
  },
  addresses: {
    user(userId) {
      return `addresses:user:${userId}`;
    }
  },
  locations: {
    cities: "locations:cities",
    states: "locations:states",
    countries: "locations:countries"
  }
};
