const { Queue } = require("bullmq");
const redisConnection = require("../redisConfig");

const orderQueue = new Queue("orderQueue", {
  connection: redisConnection,
});

module.exports = { orderQueue };
