"use strict";

const sellerProfilesData = require("../src/data/sellerProfiles.data");
const usersData = require("../src/data/users.data");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Get user IDs for sellers
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE role = 'SELLER'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const emailToIdMap = {};
    users.forEach((u) => {
      emailToIdMap[u.email] = u.id;
    });

    // We assume sellerProfilesData matches sequentially with usersData sellers
    // or we map by order. For safety, let's map by order.
    const sellerEmails = usersData.filter((u) => u.role === 'SELLER').map((u) => u.email);

    // 2. Get existing seller profiles
    const existingProfiles = await queryInterface.sequelize.query(
      `SELECT user_id FROM seller_profiles`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingUserIds = new Set(existingProfiles.map((p) => p.user_id));

    const newProfiles = [];
    
    for (let i = 0; i < sellerProfilesData.length; i++) {
      const profile = sellerProfilesData[i];
      const email = sellerEmails[i];
      const userId = emailToIdMap[email];

      if (userId && !existingUserIds.has(userId)) {
        newProfiles.push({
          user_id: userId,
          store_name: profile.store_name,
          business_info: profile.business_info,
          is_store_verified: profile.is_store_verified,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (newProfiles.length > 0) {
      await queryInterface.bulkInsert("seller_profiles", newProfiles);
      console.log(`${newProfiles.length} seller profiles inserted.`);
    } else {
      console.log("No new seller profiles to insert.");
    }
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'SELLER'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryInterface.bulkDelete("seller_profiles", {
        user_id: userIds,
      });
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },
};
