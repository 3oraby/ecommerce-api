"use strict";

const { hashPassword } = require("../src/utils/password.util");
const usersData = require("../src/data/users.data");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const newUsers = [];
    for (const user of usersData) {
      if (!existingEmails.has(user.email)) {
        const hashedPassword = await hashPassword(user.plain_password);
        newUsers.push({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          account_status: user.account_status,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    if (newUsers.length > 0) {
      await queryInterface.bulkInsert("users", newUsers);
      console.log(`${newUsers.length} users inserted.`);
    } else {
      console.log("No new users to insert.");
    }

    // Print login credentials
    console.log("\n====================================");
    console.log("LOGIN CREDENTIALS (DEMO)");
    console.log("====================================");
    for (const user of usersData) {
      const roleStr = String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1);
      console.log(`${roleStr}:`);
      console.log(`email: ${user.email}`);
      console.log(`password: ${user.plain_password}\n`);
    }
  },

  async down(queryInterface, Sequelize) {
    const emails = usersData.map((u) => u.email);
    
    // Disable FK checks to allow safe truncate/delete
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await queryInterface.bulkDelete("users", {
      email: emails,
    });
    
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
