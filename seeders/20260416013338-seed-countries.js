"use strict";
const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "../src/data/countries.json");
    const countries = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const formattedCountries = countries.map((country) => ({
      name: country.name,
      code: country.code,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("countries", formattedCountries);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("countries", null, {});
  },
};
