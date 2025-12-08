"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUMs first - check if they don't already exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ratings_status') THEN
          CREATE TYPE enum_ratings_status AS ENUM ('active', 'hidden', 'flagged');
        END IF;
      END $$;
    `);

    await queryInterface.createTable("ratings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      outlet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "outlets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: false,
        validate: {
          min: 1.0,
          max: 5.0,
        },
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      food_rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        validate: {
          min: 1.0,
          max: 5.0,
        },
      },
      delivery_rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        validate: {
          min: 1.0,
          max: 5.0,
        },
      },
      service_rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        validate: {
          min: 1.0,
          max: 5.0,
        },
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Only verified purchases can rate",
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reported_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "hidden", "removed"),
        allowNull: false,
        defaultValue: "active",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex("ratings", ["rating"]);
    await queryInterface.addIndex("ratings", ["is_verified", "status"]);
    await queryInterface.addIndex("ratings", ["created_at"]);

    // Add unique constraint to prevent multiple ratings for same order
    await queryInterface.addConstraint("ratings", {
      fields: ["user_id", "order_id"],
      type: "unique",
      name: "unique_user_order_rating",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ratings");
  },
};
