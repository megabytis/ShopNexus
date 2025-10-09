const express = require("express");

const { connectDB } = require("./config/databse");

const app = express();

require("dotenv").config();

connectDB()
  .then(() => {
    console.log("DB connected to App!");
    app.listen(8888),
      () => {
        console.log("Server is Listening on port 8888");
      };
  })
  .catch((err) => {
    console.log("DB connection Error: ", err);
  });
