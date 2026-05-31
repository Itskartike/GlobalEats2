"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Skip if orders table doesn't exist (nothing to update)
    const [rows] = await queryInterface.sequelize.query(
      `SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='orders' LIMIT 1;`
    );
    if (rows.length === 0) return;

    // Drop any existing FK on orders.address_id (name may vary by Sequelize version)
    await queryInterface.sequelize.query(`
      DO $$ DECLARE
        v_constraint TEXT;
      BEGIN
        SELECT tc.constraint_name INTO v_constraint
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'orders'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'address_id'
        LIMIT 1;

        IF v_constraint IS NOT NULL THEN
          EXECUTE 'ALTER TABLE orders DROP CONSTRAINT "' || v_constraint || '"';
        END IF;
      END $$;
    `);

    // Re-add with ON DELETE SET NULL
    await queryInterface.addConstraint("orders", {
      fields: ["address_id"],
      type: "foreign key",
      name: "orders_address_id_fkey",
      references: {
        table: "addresses",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("orders", "orders_address_id_fkey");

    await queryInterface.addConstraint("orders", {
      fields: ["address_id"],
      type: "foreign key",
      name: "orders_address_id_fkey",
      references: {
        table: "addresses",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};