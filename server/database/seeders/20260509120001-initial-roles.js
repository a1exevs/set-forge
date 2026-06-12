'use strict';

/**
 * Seeds the two roles the application code references by string:
 *   - `user`  — assigned to every newly registered account in users.service.ts
 *   - `admin` — used by RolesGuard / @Roles('admin') on privileged endpoints
 *
 * Idempotent: re-running the seeder is a no-op because of the (value) UNIQUE constraint
 * combined with `ignoreDuplicates`. Safe to run on partially-seeded databases.
 */

const ROLES = [
  { value: 'user', description: 'Default user role assigned on registration' },
  { value: 'admin', description: 'Administrator with full access' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', ROLES, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      value: { [Sequelize.Op.in]: ROLES.map(r => r.value) },
    });
  },
};
