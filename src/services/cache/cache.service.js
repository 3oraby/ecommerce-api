const { redisClient } = require("../../config/redis");

exports.getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

exports.setCache = async (key, value, ttl = 60) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttl,
  });
};

exports.deleteCache = async (key) => {
  await redisClient.del(key);
};

exports.deleteByPattern = async (pattern) => {
  const stream = redisClient.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  });

  const keys = [];
  for await (const key of stream) {
    keys.push(key);
  }

  if (keys.length) {
    await redisClient.del(keys);
  }
};