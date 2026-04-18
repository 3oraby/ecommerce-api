"use strict";

const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "../src/data/cities.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // get all states from DB
    const [dbStates] = await queryInterface.sequelize.query(
      `SELECT id, name FROM states`,
    );

    const stateNameToId = dbStates.reduce((acc, state) => {
      acc[state.name.toLowerCase()] = state.id;
      return acc;
    }, {});

    // existing cities
    const [existingCitiesRaw] = await queryInterface.sequelize.query(
      `SELECT state_id, name FROM cities`,
    );

    const existingCitiesSet = new Set(
      existingCitiesRaw.map(
        (city) => `${city.state_id}-${city.name.toLowerCase()}`,
      ),
    );

    const citiesToInsert = [];

    // ✅ loop on countries → states → cities
    for (const country of Object.values(data)) {
      for (const [stateName, cities] of Object.entries(country)) {
        const stateId = stateNameToId[stateName.toLowerCase()];

        if (!stateId) {
          console.warn(`⚠️ State not found: ${stateName}`);
          continue;
        }

        for (const cityName of cities) {
          const uniqueKey = `${stateId}-${cityName.toLowerCase()}`;

          if (!existingCitiesSet.has(uniqueKey)) {
            citiesToInsert.push({
              state_id: stateId,
              name: cityName,
              created_at: new Date(),
              updated_at: new Date(),
            });

            existingCitiesSet.add(uniqueKey);
          }
        }
      }
    }

    if (citiesToInsert.length > 0) {
      console.log(`🚀 Inserting ${citiesToInsert.length} cities...`);
      await queryInterface.bulkInsert("cities", citiesToInsert);
    } else {
      console.log("✅ No new cities to insert");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cities", null, {});
  },
};
