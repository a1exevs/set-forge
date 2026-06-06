'use strict';

/**
 * Workout lists schema.
 *
 * Adds the `workout_lists` and `workout_exercises` tables backing the workout-list API
 * (server/src/workout-lists). Mirrors the sequelize-typescript models:
 *   - UUID string primary keys (default generated in the app layer / DB default UUIDV4).
 *   - `workout_lists.user_id` → `users.id` with ON DELETE CASCADE (a user's lists are removed
 *     when the user is deleted).
 *   - `workout_exercises.workout_list_id` → `workout_lists.id` with ON DELETE CASCADE (exercises
 *     are removed with their parent list).
 * Charset/collation match the rest of the schema (utf8 / utf8_general_ci).
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const utf8 = { charset: 'utf8', collate: 'utf8_general_ci' };

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
    // Drop in reverse FK order so MySQL doesn't reject the operation.
    await queryInterface.dropTable('workout_exercises');
    await queryInterface.dropTable('workout_lists');
  },
};
