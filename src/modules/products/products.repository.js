const { Op } = require("sequelize");
const sequelize = require("../../config/sequelize");
const { Product, ProductCategory, ProductImage } = require("./products.model");
const Category = require("../categories/categories.model");
const SellerProfile = require("../sellers/sellers.model");

exports.findById = async (id) => {
  return await Product.findByPk(id, {
    include: [
      { model: Category, as: "categories", attributes: ["id", "name"] },
      { model: ProductImage, as: "images" },
    ],
  });
};

exports.findAll = async ({
  parsedPagination,
  parsedSort,
  parsedAttributes,
  parsedFilters,
}) => {
  const options = {
    where: parsedFilters || {},
    order: parsedSort || [["created_at", "DESC"]],
    ...parsedPagination,
  };

  if (parsedAttributes) {
    options.attributes = parsedAttributes;
  }

  options.include = [
    { model: Category, as: "categories", attributes: ["id", "name"] },
  ];

  return await Product.findAndCountAll(options);
};

exports.createProductWithCategoriesAndImages = async (
  productData,
  categoryIds,
  productImages,
) => {
  return await sequelize.transaction(async (t) => {
    const product = await Product.create(productData, {
      transaction: t,
    });

    if (categoryIds?.length) {
      const records = categoryIds.map((catId) => ({
        product_id: product.id,
        category_id: catId,
      }));

      await ProductCategory.bulkCreate(records, { transaction: t });
    }

    if (productImages?.length) {
      const images = productImages.map((img) => ({
        ...img,
        product_id: product.id,
      }));

      await ProductImage.bulkCreate(images, { transaction: t });
    }

    return product;
  });
};

exports.findWithCategoriesOrSearch = async ({
  where = {},
  parsedSort,
  parsedAttributes,
  parsedPagination,
  searchKeyword,
  categoryId,
}) => {
  if (searchKeyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${searchKeyword}%` } },
      { description: { [Op.like]: `%${searchKeyword}%` } },
    ];
  }

  const options = {
    where,
    order: parsedSort || [["created_at", "DESC"]],

    limit: parsedPagination?.limit || 10,
    offset: parsedPagination?.offset || 0,

    subQuery: false,

    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["id", "name"],
        through: { attributes: [] },
        required: false,
      },
      {
        model: ProductImage,
        as: "images",
        required: false,
      },
    ],

    distinct: true,
    col: "id",
  };

  if (parsedAttributes?.length) {
    options.attributes = parsedAttributes;
  }

  if (categoryId) {
    options.include[0].where = { id: Number(categoryId) };
    options.include[0].required = true;
  }

  const result = await Product.findAndCountAll(options);

  return {
    total: result.count,
    page: Math.floor(parsedPagination.offset / parsedPagination.limit) + 1,
    limit: parsedPagination.limit,
    data: result.rows,
  };
};

exports.updateProductWithCategories = async (id, productData, categoryIds) => {
  return await sequelize.transaction(async (t) => {
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) return null;

    await product.update(productData, { transaction: t });

    if (categoryIds) {
      await ProductCategory.destroy({
        where: { product_id: id },
        transaction: t,
      });
      if (categoryIds.length > 0) {
        const records = categoryIds.map((catId) => ({
          product_id: id,
          category_id: catId,
        }));
        await ProductCategory.bulkCreate(records, { transaction: t });
      }
    }

    return product;
  });
};

exports.deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return true;
};

exports.getFeaturedProducts = async () => {
  return await Product.findAll({
    order: [["rating", "DESC"]],
    limit: 10,
    attributes: ["id", "name", "price", "main_image", "rating"],
  });
};

exports.getNewArrivals = async () => {
  return await Product.findAll({
    order: [["created_at", "DESC"]],
    limit: 10,
    attributes: ["id", "name", "price", "main_image", "created_at"],
  });
};

exports.getTopRatedProducts = async () => {
  return await Product.findAll({
    where: {
      rating: { [Op.gte]: 4 },
    },
    order: [["rating", "DESC"]],
    limit: 10,
    attributes: ["id", "name", "price", "main_image", "rating"],
  });
};

exports.getBestSellers = async () => {
  const results = await sequelize.query(
    `
    SELECT p.id, p.name, p.price, p.main_image, SUM(oi.quantity) as sold_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'DELIVERED'
    GROUP BY p.id
    ORDER BY sold_count DESC
    LIMIT 10
    `,
    { type: sequelize.QueryTypes.SELECT }
  );

  return results;
};

exports.getHomeCategories = async () => {
  return await Category.findAll({
    attributes: ["id", "name"],
    limit: 10,
  });
};
