'use strict';

/**
 * Drop `completed_sets` from `workout_exercises`.
 *
 * Progress is now owned exclusively by workout sessions
 * (`workout_session_exercises.completed_sets`). The workout list is a pure
 * template, so its exercises no longer carry per-set progress.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('workout_exercises', 'completed_sets');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('workout_exercises', 'completed_sets', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
