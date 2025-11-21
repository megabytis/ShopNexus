require("dotenv").config();

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

const app = express();

app.use(
  cors({
    origin: [
      //"http://localhost:5173", // Local development
      "https://shop-nexus-beta.vercel.app", // Production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieparser());

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
