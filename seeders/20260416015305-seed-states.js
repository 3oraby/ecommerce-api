"use strict";

const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "../src/data/states.json");
    const groupedStates = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const countryCodes = Object.keys(groupedStates);

    if (countryCodes.length === 0) return;

    const [dbCountries] = await queryInterface.sequelize.query(
      `SELECT id, code FROM countries WHERE code IN ('${countryCodes.join("','")}')`,
    );

    const countryCodeToId = dbCountries.reduce((acc, country) => {
      acc[country.code] = country.id;
      return acc;
    }, {});

    const [existingStatesRaw] = await queryInterface.sequelize.query(
      `SELECT country_id, name FROM states`,
    );

    const existingStatesSet = new Set(
      existingStatesRaw.map((s) => `${s.country_id}-${s.name.toLowerCase()}`),
    );

    const statesToInsert = [];

    for (const [code, stateNames] of Object.entries(groupedStates)) {
      const countryId = countryCodeToId[code];

      if (!countryId) continue;

      stateNames.forEach((stateName) => {
        const uniqueKey = `${countryId}-${stateName.toLowerCase()}`;

        if (!existingStatesSet.has(uniqueKey)) {
          statesToInsert.push({
            country_id: countryId,
            name: stateName,
            created_at: new Date(),
            updated_at: new Date(),
          });
          existingStatesSet.add(uniqueKey);
        }
      });
    }

    if (statesToInsert.length > 0) {
      await queryInterface.bulkInsert("states", statesToInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("TRUNCATE TABLE states");
  },
};
