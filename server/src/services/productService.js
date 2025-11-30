const { productModel } = require("../models/product");

async function createProduct(data) {
  const { title, description, price, stock, image, category } = data;

  const isSameTitleAvailable = await productModel.findOne({ title }).lean();

  if (isSameTitleAvailable) {
    throw new Error("Duplicate Title not Allowed!");
  }

  const foundCategory = await categoriesModel.findOne({ _id: category });
  if (!foundCategory) {
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

async function getProducts(filters) {
  let {
    category,
    minPrice,
    maxPrice,
    min,
    max,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    search,
  } = filters;

  const filterQuery = {};

  // CATEGORY-filter
  if (category) {
    const foundCategory = await categoriesModel.findOne({
      _id: category,
    });
    if (!foundCategory) {
      throw new Error("Category not found!");
    }

    filterQuery.category = category;
  }

  // PRICE-filter
  if (min) minPrice = min;
  if (max) maxPrice = max;

  minPrice = Number(minPrice);
  maxPrice = Number(maxPrice);
  if (minPrice && maxPrice) filter.price = { $gte: minPrice, $lte: maxPrice };
  else if (minPrice) filterQuery.price = { $gte: minPrice };
  else if (maxPrice) filterQuery.price = { $lte: maxPrice };

  // SEARCH-filter
  if (search) {
    filterQuery.$or = [
      {
        title: { $regex: search, $options: "i" },
      },
      {
        description: { $regex: search, $options: "i" },
      },
    ];
  }

  // PAGINATION
  page = parseInt(page) || 1;

  const MAX_LIMIT = 12;
  limit = parseInt(limit) || MAX_LIMIT;
  limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;

  const skip = (page - 1) * limit;

  const totalPosts = await productModel.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalPosts / limit);

  if (page > totalPages && totalPages > 0) {
    throw new Error("Page limit Exceeded!");
  }

  // Sorting Logic
  const sortOptions = {};
  if (sortBy === "createdAt") {
    sortOptions.createdAt = -1; // Newest first
  } else if (sortBy === "price") {
    sortOptions.price = 1; // Low to High
  } else if (sortBy === "-price") {
    sortOptions.price = -1; // High to Low
  } else if (sortBy === "title") {
    sortOptions.title = 1; // A-Z
  } else {
    sortOptions.createdAt = -1; // Default
  }

  const products = await productModel
    .find(filterQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("category", "name");

  const total = await productModel.countDocuments(filterQuery);

  return { products, total };
}

module.exports = {
  createProduct,
  getProducts,
};
