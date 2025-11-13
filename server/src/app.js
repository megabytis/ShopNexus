require("dotenv").config();

const express = require("express");
const cookieparser = require("cookie-parser");

const { connectDB } = require("./config/database");

const authRouter = require("./routers/auth");
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const cartRouter = require("./routers/cart");

const app = express();

app.use(express.json());
app.use(cookieparser());

app.use("/", authRouter);
app.use("/", categoriesRouter);
app.use("/", productsRouter);
app.use("/", cartRouter);

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
