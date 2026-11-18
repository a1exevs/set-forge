'use strict';

/**
 * The server keeps no browser session any more: the captcha and the failed sign-in counts live in Redis. The
 * `sessions` table was made by the session store at boot, not by a migration, so it may be missing.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `sessions`');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      sid: { type: Sequelize.STRING(255), primaryKey: true, allowNull: false },
      data: { type: Sequelize.TEXT('long'), allowNull: false },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
};
