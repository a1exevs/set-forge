'use strict';

/**
 * Opaque refresh tokens: a row keeps the SHA-256 of the token instead of being named by a signed JWT, and the unused
 * `is_revoked` goes (revocation deletes the row). The rows of the JWT era cannot be matched to a hash, so they are
 * deleted: every session signs in again once.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('refreshTokens', {});
    await queryInterface.addColumn('refreshTokens', 'token_hash', {
      type: Sequelize.CHAR(64),
      allowNull: false,
    });
    await queryInterface.addIndex('refreshTokens', ['token_hash'], {
      name: 'refresh_tokens_token_hash',
      unique: true,
    });
    await queryInterface.removeColumn('refreshTokens', 'is_revoked');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('refreshTokens', {});
    await queryInterface.addColumn('refreshTokens', 'is_revoked', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.removeIndex('refreshTokens', 'refresh_tokens_token_hash');
    await queryInterface.removeColumn('refreshTokens', 'token_hash');
  },
};
