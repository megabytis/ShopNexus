const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const { connectDB } = require("./src/config/database");

const authRouter = require("./src/routers/auth");
const categoriesRouter = require("./src/routers/categories");
const productsRouter = require("./src/routers/products");
const cartRouter = require("./src/routers/cart");
const checkoutRouter = require("./src/routers/checkout");
const orderRouter = require("./src/routers/orders");
const paymentRouter = require("./src/routers/payment");

const { webhook } = require("./src/controllers/paymentController");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// Stripe Webhook - Must be before express.json()
app.post("/webhook", express.raw({ type: "application/json" }), webhook);

app.use(express.json());
app.use(cookieparser());

// Health check endpoint for Docker and monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/", authRouter);
app.use("/", categoriesRouter);
app.use("/", productsRouter);
app.use("/", cartRouter);
app.use("/", checkoutRouter);
app.use("/", orderRouter);
app.use("/", paymentRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: `ERROR: ${err.message}` });
});

connectDB()
  .then(() => {
    console.log("DB connected to App!");
    app.listen(8888, () => {
      console.log("Server is Listening on port 8888");
    });
  })
  .catch((err) => {
    console.log("DB connection Error: ", err);
  });
