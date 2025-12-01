import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./src/config/database.js";

import authRouter from "./src/routers/auth";
import categoriesRouter from "./src/routers/categories";
import productsRouter from "./src/routers/products";
import cartRouter from "./src/routers/cart";
import checkoutRouter from "./src/routers/checkout";
import orderRouter from "./src/routers/orders";

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
  })
);

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
