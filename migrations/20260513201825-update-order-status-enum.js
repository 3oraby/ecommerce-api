"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE orders SET status = 'CANCELED' WHERE status NOT IN ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELED');`);
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY COLUMN status ENUM(
        'PENDING',
        'SHIPPED',
        'DELIVERED',
        'CANCELED'
      ) NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Cannot easily revert dropped statuses without data loss, leave as is
  },
};
