"use strict";

const productsData = require("../src/data/products.data");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const productNameToId = {};
    products.forEach((p) => {
      productNameToId[p.name] = p.id;
    });

    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const categoryNameToId = {};
    categories.forEach((c) => {
      categoryNameToId[c.name.toLowerCase()] = c.id;
    });

    const newMappings = [];

    for (const productData of productsData) {
      const productId = productNameToId[productData.name];
      if (!productId) continue;

      for (const catName of productData.category_names) {
        const categoryId = categoryNameToId[catName.toLowerCase()];
        if (categoryId) {
          newMappings.push({
            product_id: productId,
            category_id: categoryId,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    if (newMappings.length > 0) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      // For idempotency, clear existing ones for these products
      const productIds = Object.values(productNameToId);
      if (productIds.length > 0) {
        await queryInterface.bulkDelete("product_categories", { product_id: productIds });
      }

      await queryInterface.bulkInsert("product_categories", newMappings);
      console.log(`${newMappings.length} product-category mappings inserted.`);
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      console.log("No new product-category mappings to insert.");
    }
  },

  async down(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      `SELECT id FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryInterface.bulkDelete("product_categories", {
        product_id: productIds,
      });
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },
};
