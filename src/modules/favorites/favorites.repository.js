const Favorite = require("./favorites.model");
const { Product, ProductCategory, ProductImage } = require("../products/products.model");
const Category = require("../categories/categories.model");

exports.findUserFavorites = async (userId, limit, offset, order) => {
  return await Favorite.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: order || [["added_at", "DESC"]],
    distinct: true,
    include: [
      {
        model: Product,
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
          },
        ],
      },
    ],
  });
};

exports.findOneFavorite = async (userId, productId) => {
  return await Favorite.findOne({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });
};

exports.createFavorite = async (userId, productId) => {
  return await Favorite.create({ user_id: userId, product_id: productId });
};

exports.deleteFavorite = async (userId, productId) => {
  const favorite = await Favorite.findOne({
    where: { user_id: userId, product_id: productId },
  });
  if (!favorite) return false;
  await favorite.destroy();
  return true;
};
