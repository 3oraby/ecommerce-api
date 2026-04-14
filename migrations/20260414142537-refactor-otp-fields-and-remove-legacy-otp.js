"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET 
        email_otp = otp,
        email_otp_expires_at = otp_expires_at,
        email_otp_sent_at = otp_sent_at
      WHERE otp IS NOT NULL;
    `);

    await queryInterface.removeColumn("users", "otp");
    await queryInterface.removeColumn("users", "otp_expires_at");
    await queryInterface.removeColumn("users", "otp_sent_at");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "otp_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "otp_sent_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE users
      SET 
        otp = email_otp,
        otp_expires_at = email_otp_expires_at,
        otp_sent_at = email_otp_sent_at
      WHERE email_otp IS NOT NULL;
    `);
  },
};
