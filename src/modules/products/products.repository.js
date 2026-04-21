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

exports.findAll = async ({ parsedPagination, parsedSort, parsedAttributes, parsedFilters }) => {
  const options = {
    where: parsedFilters || {},
    order: parsedSort || [["created_at", "DESC"]],
    ...parsedPagination,
  };

  if (parsedAttributes) {
    options.attributes = parsedAttributes;
  }

  options.include = [
    { model: Category, as: "categories", attributes: ["id", "name"] }
  ];

  return await Product.findAndCountAll(options);
};

exports.findWithCategoriesOrSearch = async ({ parsedPagination, parsedSort, parsedAttributes, parsedFilters, searchKeyword, categoryId }) => {
  const options = {
    where: parsedFilters || {},
    order: parsedSort || [["created_at", "DESC"]],
    ...parsedPagination,
    include: [
      { 
        model: Category, 
        as: "categories", 
        attributes: ["id", "name"],
        through: { attributes: [] } 
      },
      { model: ProductImage, as: "images" }
    ],
    distinct: true
  };

  if (parsedAttributes) {
    options.attributes = parsedAttributes;
  }

  if (searchKeyword) {
    options.where[Op.or] = [
      { name: { [Op.like]: `%${searchKeyword}%` } },
      { description: { [Op.like]: `%${searchKeyword}%` } }
    ];
  }

  if (categoryId) {
    options.include[0].where = { id: categoryId };
  }

  return await Product.findAndCountAll(options);
};

exports.createProductWithCategoriesAndImages = async (productData, categoryIds, productImages) => {
  return await sequelize.transaction(async (t) => {
    const product = await Product.create(productData, { transaction: t });

    if (categoryIds && categoryIds.length > 0) {
      const records = categoryIds.map((id) => ({
        product_id: product.id,
        category_id: id,
      }));
      await ProductCategory.bulkCreate(records, { transaction: t });
    }

    if (productImages && productImages.length > 0) {
      const imageRecords = productImages.map((img) => ({
        ...img,
        product_id: product.id,
      }));
      await ProductImage.bulkCreate(imageRecords, { transaction: t });
    }

    return product;
  });
};

exports.updateProductWithCategories = async (id, productData, categoryIds) => {
  return await sequelize.transaction(async (t) => {
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) return null;

    await product.update(productData, { transaction: t });

    if (categoryIds) {
      await ProductCategory.destroy({ where: { product_id: id }, transaction: t });
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
