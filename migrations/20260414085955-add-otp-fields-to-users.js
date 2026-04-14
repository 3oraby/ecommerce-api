"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "email_otp_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "email_otp_sent_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "reset_password_otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "reset_password_otp_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "reset_password_otp_sent_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "email_otp");
    await queryInterface.removeColumn("users", "email_otp_expires_at");
    await queryInterface.removeColumn("users", "email_otp_sent_at");

    await queryInterface.removeColumn("users", "reset_password_otp");
    await queryInterface.removeColumn("users", "reset_password_otp_expires_at");
    await queryInterface.removeColumn("users", "reset_password_otp_sent_at");
  },
};
