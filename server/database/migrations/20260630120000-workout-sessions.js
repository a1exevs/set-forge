'use strict';

/**
 * Workout sessions schema.
 *
 * Introduces the training session entity (a snapshot taken from a workout list)
 * and its exercises. A session owns its own progress (`completed_sets`) so the
 * workout list template stays a pure template and history is immune to later
 * template edits or deletions.
 *
 * Notes on FK constraints:
 *   - `workout_sessions.workout_list_id` uses ON DELETE SET NULL so completed
 *     sessions remain available in history even after the source list is deleted
 *     (the snapshot `workout_list_name` preserves the displayed name).
 *   - `workout_session_exercises.workout_session_id` uses ON DELETE CASCADE.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const utf8 = { charset: 'utf8', collate: 'utf8_general_ci' };

    await queryInterface.createTable(
      'workout_sessions',
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
        workout_list_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'workout_lists', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        workout_list_name: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
        started_at: { type: Sequelize.DATE, allowNull: false },
        finished_at: { type: Sequelize.DATE, allowNull: true },
      },
      utf8,
    );

    await queryInterface.createTable(
      'workout_session_exercises',
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: Sequelize.UUIDV4,
        },
        workout_session_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'workout_sessions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        source_exercise_id: { type: Sequelize.UUID, allowNull: true },
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

    await queryInterface.addIndex('workout_sessions', ['user_id'], {
      name: 'workout_sessions_user_id_idx',
    });
    await queryInterface.addIndex('workout_sessions', ['workout_list_id', 'status'], {
      name: 'workout_sessions_list_status_idx',
    });
    await queryInterface.addIndex('workout_session_exercises', ['workout_session_id'], {
      name: 'workout_session_exercises_session_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('workout_session_exercises');
    await queryInterface.dropTable('workout_sessions');
  },
};
