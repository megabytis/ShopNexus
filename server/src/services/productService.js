const { productModel } = require("../models/product");

async function createProduct(data) {
  const { title, description, price, stock, image, category } = data;

  const isSameTitleAvailable = await productModel.findOne({ title }).lean();

  if (isSameTitleAvailable) {
    throw new Error("Duplicate Title not Allowed!");
  }

  const isValidCategory = await categoriesModel.findOne({ _id: category });
  if (!isValidCategory) {
    throw new Error("Category not found!");
  }

  const products = new productModel({
    title: title,
    description: description,
    price: Number(price),
    stock: Number(stock),
    image: image,
    category: category,
  });

  const savedProducts = await products.save();

  return savedProducts;
}

module.exports = {
  createProduct,
};
