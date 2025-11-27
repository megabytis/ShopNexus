const { Worker } = require("bullmq");

const redisConnection = require("../redisConfig");

const orderWorker = new Worker(
  "orderQueue", // queue name as defined in orderQueue.js
  async (job) => {
    const { email, orderId, userId } = job.data;

    console.log("Job recieved", job.data);

    // 1. simulating sending an email
    console.log(`📨 Sending confirmation email to ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`✅ Email sent for order ${orderId}`);

    // 2. simulating processing order
    console.log(`📦 Processing order ${orderId}`);

    // 3. simulating payment processing
    console.log(`💳 Processing payment for order ${orderId}`);

    return true;
  },
  {
    connection: redisConnection,
  }
);

console.log("Order Worker running...");

module.exports = { orderWorker };
