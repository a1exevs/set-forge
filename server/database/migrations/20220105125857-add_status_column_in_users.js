'use strict';

//Generate migration file
//npx sequelize-cli migration:generate --name create-user

//Running Migrations
//npx sequelize-cli db:migrate

//Undoing Migrations
//npx sequelize-cli db:migrate:undo
//npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js

module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn(
      'users',
      'status',
      Sequelize.STRING
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn(
      'users',
      'status'
    );
  }
}

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     return queryInterface.createTable('test', {
//       id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         unique: true,
//         primaryKey: true,
//       },
//       email: {
//         type: Sequelize.STRING,
//         unique: true,
//         allowNull: false
//       },
//       password: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       banned: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false
//       },
//       banReason: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       test: {
//         type: Sequelize.STRING,
//         allowNull: true
//       }
//     });
//   },
//
//   down: async (queryInterface, Sequelize) => {
//     return queryInterface.dropTable('test');
//   }
// };

//----createTable
// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return queryInterface.createTable('Person', {
//       name: Sequelize.STRING,
//       isBetaMember: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//         allowNull: false
//       }
//     });
//   },
//   down: (queryInterface, Sequelize) => {
//     return queryInterface.dropTable('Person');
//   }
// }}

//----transaction
// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return queryInterface.sequelize.transaction((t) => {
//       return Promise.all([
//         queryInterface.addColumn('Person', 'petName', {
//           type: Sequelize.STRING
//         }, { transaction: t }),
//         queryInterface.addColumn('Person', 'favoriteColor', {
//           type: Sequelize.STRING,
//         }, { transaction: t })
//       ])
//     })
//   },
//
//   down: (queryInterface, Sequelize) => {
//     return queryInterface.sequelize.transaction((t) => {
//       return Promise.all([
//         queryInterface.removeColumn('Person', 'petName', { transaction: t }),
//         queryInterface.removeColumn('Person', 'favoriteColor', { transaction: t })
//       ])
//     })
//   }
// };

//----foreign key with references
// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return queryInterface.createTable('Person', {
//       name: Sequelize.STRING,
//       isBetaMember: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//         allowNull: false
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         references: {
//           model: {
//             tableName: 'users',
//             schema: 'schema'
//           }
//           key: 'id'
//         },
//         allowNull: false
//       },
//     });
//   },
//
//   down: (queryInterface, Sequelize) => {
//     return queryInterface.dropTable('Person');
//   }
// };

//----async await
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const transaction = await queryInterface.sequelize.transaction();
//     try {
//       await queryInterface.addColumn(
//         'Person',
//         'petName',
//         {
//           type: Sequelize.STRING,
//         },
//         { transaction }
//       );
//       await queryInterface.addIndex(
//         'Person',
//         'petName',
//         {
//           fields: 'petName',
//           unique: true,
//         },
//         { transaction }
//       );
//       await transaction.commit();
//     } catch (err) {
//       await transaction.rollback();
//       throw err;
//     }
//   },
//
//   async down(queryInterface, Sequelize) {
//     const transaction = await queryInterface.sequelize.transaction();
//     try {
//       await queryInterface.removeColumn('Person', 'petName', { transaction });
//       await transaction.commit();
//     } catch (err) {
//       await transaction.rollback();
//       throw err;
//     }
//   },
// };
