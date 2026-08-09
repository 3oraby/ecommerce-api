const { checkHealth } = require("./health.service");

const healthCheck = async (req, res) => {
    const health = await checkHealth();

    const statusCode = health.status === "ok" ? 200 : 503;

    return res.status(statusCode).json(health);
};

module.exports = {
    healthCheck,
};