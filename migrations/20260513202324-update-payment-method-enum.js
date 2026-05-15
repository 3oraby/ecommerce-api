"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      MODIFY COLUMN method ENUM(
        'COD',
        'VISA',
        'MOBILE_WALLET'
      ) NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      MODIFY COLUMN method ENUM(
        'COD',
        'VISA',
        'MOBILE_WALLET'
      ) NOT NULL;
    `);
  },
};
