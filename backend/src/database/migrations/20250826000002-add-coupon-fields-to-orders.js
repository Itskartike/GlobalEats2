"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "coupon_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "coupon_discount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "coupon_code");
    await queryInterface.removeColumn("orders", "coupon_discount");
  },
};
