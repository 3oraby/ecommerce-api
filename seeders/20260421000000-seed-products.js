"use strict";

const productsData = require("../src/data/products.data");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sellerProfiles = await queryInterface.sequelize.query(
      `SELECT id FROM seller_profiles ORDER BY id ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (sellerProfiles.length === 0) {
      console.log("No seller profiles found. Skipping products seed.");
      return;
    }

    const existingProducts = await queryInterface.sequelize.query(
      `SELECT name FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = new Set(existingProducts.map((p) => p.name));

    const newProducts = [];
    
    for (const product of productsData) {
      if (!existingNames.has(product.name)) {
        const sellerProfile = sellerProfiles[product.seller_index];
        if (sellerProfile) {
          newProducts.push({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            rating: product.rating,
            seller_id: sellerProfile.id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    if (newProducts.length > 0) {
      await queryInterface.bulkInsert("products", newProducts);
      console.log(`${newProducts.length} products inserted.`);
    } else {
      console.log("No new products to insert.");
    }
  },

  async down(queryInterface, Sequelize) {
    const names = productsData.map((p) => p.name);
    
    if (names.length > 0) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryInterface.bulkDelete("products", {
        name: names,
      });
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },
};
