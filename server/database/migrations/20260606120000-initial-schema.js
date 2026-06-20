'use strict';

/**
 * Initial schema for the Set-Forge backend.
 *
 * Single migration covering auth, roles, refresh tokens, and workout lists.
 * Profile tables and unused user columns (banned, status) are intentionally omitted.
 *
 * Notes on FK constraints:
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
      'workout_lists',
      {
        id: {
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
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        created_at: { type: Sequelize.DATE, allowNull: false },
        last_used_at: { type: Sequelize.DATE, allowNull: true },
      },
      utf8,
    );

    await queryInterface.createTable(
      'workout_exercises',
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: Sequelize.UUIDV4,
        },
        workout_list_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'workout_lists', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        name: { type: Sequelize.STRING, allowNull: false },
        muscle_group: { type: Sequelize.STRING, allowNull: false },
        weight: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
        reps: { type: Sequelize.INTEGER, allowNull: false },
        sets: { type: Sequelize.INTEGER, allowNull: false },
        completed_sets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      },
      utf8,
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('workout_exercises');
    await queryInterface.dropTable('workout_lists');
    await queryInterface.dropTable('refreshTokens');
    await queryInterface.dropTable('users_roles');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
  },
};
