"use strict";

const fs = require("fs");
const path = require("path");
const productsData = require("../src/data/products.data");
const storageProvider = require("../src/services/storage/storage.provider");
const { initSeedEnvironment } = require("../src/bootstrap/seed.bootstrap");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await initSeedEnvironment();
    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const productNameToId = {};
    products.forEach((p) => {
      productNameToId[p.name] = p.id;
    });

    const newImages = [];
    const mainImagesUpdates = [];

    // The base directory where the images are expected to be located
    const baseDir = path.join(__dirname, "../public/seeds/products");
    
    // Create directory if it doesn't exist just to prevent errors
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    for (const productData of productsData) {
      const productId = productNameToId[productData.name];
      if (!productId) continue;

      const productFolder = path.join(baseDir, productData.folder);
      
      let imageFiles = [];
      if (fs.existsSync(productFolder)) {
        imageFiles = fs.readdirSync(productFolder).filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
      }

      if (imageFiles.length === 0) {
        console.warn(`No local images found for product ${productData.name} in folder ${productFolder}. Skipping uploads.`);
        continue;
      }

      for (let index = 0; index < imageFiles.length; index++) {
        const file = imageFiles[index];
        const localFilePath = path.join(productFolder, file);
        const destinationPath = `${productData.folder}/${file}`;
        
        try {
          console.log(`Uploading image for ${productData.name}: ${file}...`);
          const publicUrl = await storageProvider.uploadLocalFile(localFilePath, destinationPath);
          console.log(`Uploaded successfully. Public URL generated.`);

          const isMain = index === 0;

          newImages.push({
            product_id: productId,
            image_url: publicUrl,
            is_main: isMain,
            created_at: new Date(),
            updated_at: new Date(),
          });

          if (isMain) {
            mainImagesUpdates.push({
              id: productId,
              main_image: publicUrl,
            });
          }
          console.log(`Image linked to product ${productData.name}.`);
        } catch (error) {
          console.error(`Failed to upload ${file} for product ${productData.name}:`, error.message);
        }
      }
    }

    // Insert Product Images
    if (newImages.length > 0) {
      // Avoid inserting duplicates if already seeded
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      // For idempotency, we can just clear existing seeds for these products
      const productIds = Object.values(productNameToId);
      if (productIds.length > 0) {
        await queryInterface.bulkDelete("product_images", { product_id: productIds });
      }

      await queryInterface.bulkInsert("product_images", newImages);
      console.log(`${newImages.length} product images inserted.`);
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      // Update Main Image in products
      for (const update of mainImagesUpdates) {
        await queryInterface.bulkUpdate(
          "products",
          { main_image: update.main_image },
          { id: update.id }
        );
      }
      console.log(`Main images updated for ${mainImagesUpdates.length} products.`);
    }
  },

  async down(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryInterface.bulkDelete("product_images", {
        product_id: productIds,
      });
      await queryInterface.bulkUpdate(
        "products",
        { main_image: null },
        { id: productIds }
      );
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },
};
