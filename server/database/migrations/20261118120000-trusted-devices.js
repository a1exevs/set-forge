'use strict';

/**
 * Devices a user signed in on: the account-wide count of failed sign-ins does not apply to them
 * (session/trusted-device). A row goes with its user (session/deletion-cascade).
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trusted_devices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token_hash: { type: Sequelize.CHAR(64), allowNull: false },
      expires: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('trusted_devices', ['token_hash', 'user_id'], {
      name: 'trusted_devices_token_hash_user_id',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('trusted_devices');
  },
};
