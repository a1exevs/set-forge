'use strict';

/**
 * Versioned legal-document acceptance on `users`.
 *
 * Records which version of the Terms of Use / Privacy Policy a user accepted and when.
 * Columns are nullable so existing users (who registered before this feature) are treated
 * as "not yet accepted" and prompted to re-accept on their next visit.
 *
 * TODO: once existing users have re-accepted, tighten `accepted_terms_version` and
 * `accepted_privacy_version` to NOT NULL in a follow-up migration.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'accepted_terms_version', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'accepted_privacy_version', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'accepted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'accepted_at');
    await queryInterface.removeColumn('users', 'accepted_privacy_version');
    await queryInterface.removeColumn('users', 'accepted_terms_version');
  },
};
