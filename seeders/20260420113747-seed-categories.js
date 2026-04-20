"use strict";

const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "../src/data/categories.json");
    const categoriesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // 🟢 get existing categories
    const existingCategories = await queryInterface.sequelize.query(
      `SELECT name FROM categories`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const existingNames = new Set(
      existingCategories.map((c) => c.name.toLowerCase()),
    );

    // 🟢 filter new categories only
    const newCategories = categoriesData
      .filter((cat) => !existingNames.has(cat.name.toLowerCase()))
      .map((cat) => ({
        name: cat.name,
        description: cat.description || null,
        image: null,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (newCategories.length === 0) {
      console.log("No new categories to insert.");
      return;
    }

    await queryInterface.bulkInsert("categories", newCategories);

    console.log(`${newCategories.length} categories inserted.`);
  },

  async down(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "../src/data/categories.json");
    const categoriesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const names = categoriesData.map((c) => c.name);

    await queryInterface.bulkDelete("categories", {
      name: names,
    });
  },
};
