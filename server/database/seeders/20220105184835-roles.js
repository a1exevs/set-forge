"use strict";

//Creating Seeds
//npx sequelize-cli seed:generate --name name_of_seed

//Running Seeds
//npx sequelize-cli db:seed:all

//Undoing Seeds
//npx sequelize-cli db:seed:undo
//npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data
//npx sequelize-cli db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("roles", [{
        id: 1,
        value: "admin",
        description: "Администратор системы"
      },
      {
        id: 2,
        value: "user",
        description: "Простой пользователь"
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("roles", null, {});
  }
};