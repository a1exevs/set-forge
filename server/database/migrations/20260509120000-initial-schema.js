'use strict';

/**
 * Initial schema for the Set-Forge backend.
 *
 * Replaces the previous reliance on `sequelize.sync()` (which only ran in non-production
 * builds). Tables, columns, charsets, indexes and FK constraints below mirror what the
 * sequelize-typescript models in `src/**` would produce on `sync()` so that databases
 * created with this migration are byte-compatible with existing dev databases.
 *
 * Notes on FK constraints:
 *   - `user_common_info.user_id`, `user_contacts.user_id`, `user_avatars.user_id` carry
 *     `@ForeignKey(() => User)` decorators in the model layer. We materialise them as
 *     real FK constraints here (with ON DELETE CASCADE) — that matches what sequelize
 *     emits via sync() and is what new deployments should have. Older databases built
 *     without these FKs are not affected: the migration runs once on a fresh schema.
 *   - The `sessions` table is intentionally not included: it is owned by
 *     SequelizeSessionStore which calls `Model.sync()` itself on app boot and is
 *     decoupled from the application schema lifecycle.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const utf8 = { charset: 'utf8', collate: 'utf8_general_ci' };

    await queryInterface.createTable(
      'roles',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        value: { type: Sequelize.STRING, allowNull: false, unique: true },
        description: { type: Sequelize.STRING, allowNull: false },
      },
      utf8,
    );

    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        banned: { type: Sequelize.BOOLEAN, defaultValue: false },
        ban_reason: { type: Sequelize.STRING, allowNull: true },
        status: { type: Sequelize.STRING, allowNull: true },
      },
      utf8,
    );

    await queryInterface.createTable('users_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('refreshTokens', {
      uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_revoked: { type: Sequelize.BOOLEAN, defaultValue: false },
      expires: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable(
      'user_common_info',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        full_name: { type: Sequelize.STRING, allowNull: false },
        about_me: { type: Sequelize.STRING, allowNull: true },
        looking_for_a_job: { type: Sequelize.BOOLEAN, defaultValue: false },
        looking_for_a_job_description: { type: Sequelize.STRING, allowNull: true },
      },
      utf8,
    );

    await queryInterface.createTable(
      'user_contacts',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        facebook: { type: Sequelize.STRING, allowNull: true },
        website: { type: Sequelize.STRING, allowNull: true },
        twitter: { type: Sequelize.STRING, allowNull: true },
        instagram: { type: Sequelize.STRING, allowNull: true },
        youtube: { type: Sequelize.STRING, allowNull: true },
        github: { type: Sequelize.STRING, allowNull: true },
        vk: { type: Sequelize.STRING, allowNull: true },
        main_link: { type: Sequelize.STRING, allowNull: true },
      },
      utf8,
    );

    await queryInterface.createTable(
      'user_avatars',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        small: { type: Sequelize.STRING, allowNull: false },
        large: { type: Sequelize.STRING, allowNull: false },
      },
      utf8,
    );
  },

  async down(queryInterface) {
    // Drop in reverse FK order so MySQL doesn't reject the operation.
    await queryInterface.dropTable('user_avatars');
    await queryInterface.dropTable('user_contacts');
    await queryInterface.dropTable('user_common_info');
    await queryInterface.dropTable('refreshTokens');
    await queryInterface.dropTable('users_roles');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
  },
};
