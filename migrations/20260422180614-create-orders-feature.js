"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. orders
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "addresses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SHIPPED", "DELIVERED", "CANCELED"),
        defaultValue: "PENDING",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("orders", ["user_id"]);

    // 2. order_items
    await queryInterface.createTable("order_items", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("order_items", ["order_id"]);
    await queryInterface.addIndex("order_items", ["product_id"]);

    // 3. payments
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      method: {
        type: Sequelize.ENUM("COD", "VISA", "FAWRY", "PAYPAL"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "COMPLETED", "FAILED"),
        defaultValue: "PENDING",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("payments", ["order_id"]);

    // 4. shipping (mapped to "shippings" table to exactly match the Model's tableName)
    await queryInterface.createTable("shippings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SHIPPED", "DELIVERED", "CANCELED"),
        defaultValue: "PENDING",
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("shippings", ["order_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in correct reverse order
    await queryInterface.dropTable("shippings");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("order_items");
    await queryInterface.dropTable("orders");

    // Also drop ENUM types safely if dialect is PostgreSql to avoid type residue collisions
    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status" CASCADE;');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_method" CASCADE;');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_status" CASCADE;');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_shippings_status" CASCADE;');
    }
  },
};
