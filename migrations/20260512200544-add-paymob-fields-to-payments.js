"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "transaction_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("payments", "paymob_order_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("payments", "paymob_payment_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("payments", "paid_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("payments", "transaction_id");
    await queryInterface.removeColumn("payments", "paymob_order_id");
    await queryInterface.removeColumn("payments", "paymob_payment_id");
    await queryInterface.removeColumn("payments", "paid_at");
  },
};
