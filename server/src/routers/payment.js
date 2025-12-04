require("dotenv").config();
const Stripe = require("stripe");
const express = require("express");

const paymentRouter = express.Router();

const { userAuth } = require("../middleware/Auth");
const { createPaymentIntent } = require("../controllers/paymentController");

paymentRouter.post("/create-payment-intent", userAuth, createPaymentIntent);

module.exports = paymentRouter;
