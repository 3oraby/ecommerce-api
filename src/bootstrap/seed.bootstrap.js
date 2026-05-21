require("dotenv").config();

const { init } = require("../services/storage/storage.provider");

async function initSeedEnvironment() {
  await init();
}

module.exports = { initSeedEnvironment };