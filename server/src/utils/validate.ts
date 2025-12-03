import mongoose from "mongoose";
import validator from "validator";
import { Request } from "express";

export const validateSignupData = (req: Request): void => {
  const { name, email, password } = req.body;

  if (!name || String(name).trim().length < 2) {
    throw new Error("Name not valid!");
  }
  if (!email || !validator.isEmail(String(email))) {
    throw new Error("Email not valid!");
  }
  if (!password || !validator.isStrongPassword(String(password))) {
    throw new Error("Password is not strong!");
  }
};

export const validateNewCategoriesData = (req: Request): void => {
  const { name } = req.body;
  if (!name || String(name).trim().length < 2) {
    throw new Error("Invalid Category name");
  }
};

export const validateMongoID = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID!");
  }
};

interface ProductData {
  title: string;
  description: string;
  price: number | string;
  stock: number | string;
  image: string;
  category: string;
}

export const validateProductsData = (data: ProductData): void => {
  const { title, description, price, stock, image, category } = data;
  if (!title || String(title).trim().length < 1) {
    throw new Error("Invalid Title!");
  }
  if (!description || String(description).trim().length < 5) {
    throw new Error("Invalid Description!");
  }

  const p = Number(price);
  if (!Number.isFinite(p) || p < 0) {
    throw new Error("Invalid Price!");
  }

  const s = Number(stock);
  if (!Number.isInteger(s) || s < 0) {
    throw new Error("Invalid Stock!");
  }
  if (!image || !validator.isURL(String(image))) {
    throw new Error("Invalid Image URL!");
  }
  if (!category || !validator.isMongoId(String(category))) {
    throw new Error("Invalid Category ID!");
  }
};

export const validateOrderStatus = (status: string): void => {
  const validOrderStatus = ["processing", "shipped", "delivered", "cancelled"];

  if (!status) {
    throw new Error("No status provided!");
  }
  if (!validOrderStatus.includes(String(status))) {
    throw new Error("Invalid Order Status!");
  }
};
