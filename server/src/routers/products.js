const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { validateProductsData, validateMongoID } = require("../utils/validate");
const { productModel } = require("../models/product");
const { categoriesModel } = require("../models/category");
const { buildKey } = require("../utils/keyGenerator");
const { getCache, setCache, removeCache } = require("../utils/cache");

const productsRouter = express.Router();

productsRouter.post("/products", userAuth, async (req, res, next) => {
  try {
    const { title, description, price, stock, image, category } = req.body;

    validateProductsData(req);

    const isAdmin = req.user.role === "admin" ? true : false;
    if (!isAdmin) {
      throw new Error("You aren't Authorized to add products!");
    }

    const isSameTitleAvailable = await productModel.findOne({ title: title });

    if (isSameTitleAvailable) {
      throw new Error("Duplicate Title not Allowed!");
    }

    const isValidCategory = await categoriesModel.findOne({ _id: category });
    if (!isValidCategory) {
      return res.status(404).json({ error: "Category not found!" });
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

    return res.json({
      message: "Product created successfully!",
      data: savedProducts,
    });
  } catch (err) {
    next(err);
  }
});

// GET /products with multiple filters
productsRouter.get("/products", async (req, res, next) => {
  try {
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
    } = req.query;

    // Map min/max to minPrice/maxPrice if provided
    if (min) minPrice = min;
    if (max) maxPrice = max;

    // Only validate category if it's provided
    if (category) {
      const isValidCategory = await categoriesModel.findOne({ _id: category });
      if (!isValidCategory) {
        return res.status(404).json({ error: "Category not found!" });
      }
    }

    page = parseInt(page) || 1;

    const MAX_LIMIT = 12;
    limit = parseInt(limit) || MAX_LIMIT;
    limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;

    const skip = (page - 1) * limit;

    const totalPosts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages && totalPages > 0) {
      throw new Error("Page limit Exceeded!");
    }

    const filter = {};

    if (category) {
      filter.category = category;
    }

    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);
    if (minPrice && maxPrice) filter.price = { $gte: minPrice, $lte: maxPrice };
    else if (minPrice) filter.price = { $gte: minPrice };
    else if (maxPrice) filter.price = { $lte: maxPrice };

    if (search) {
      filter.$or = [
        {
          title: { $regex: search, $options: "i" },
        },
        {
          description: { $regex: search, $options: "i" },
        },
      ];
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

    // Adding Redis Caching
    const key = buildKey("products:list", {
      page,
      limit,
      sortBy,
      min: minPrice || 0,
      max: maxPrice || 99999,
      category,
      search: search || "none",
    });

    const cachedProducts = await getCache(key);
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    const products = await productModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("category", "name");

    const total = await productModel.countDocuments(filter);

    const responseData = {
      message: "Filtered Products!",
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit),
      products,
    };

    await setCache(key, responseData, 60);

    return res.json(responseData);
  } catch (err) {
    next(err);
  }
});

/*
What GET /products have :-
- finding all products and selecting specific categories to show 
- populating category, cuz product have taken reference of category, so it will populate about it's specified category in detail
- in response it will show also total number of products listed along with product details and a sweet message :) 
*/

productsRouter.get("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    validateMongoID(id);

    const foundProduct = await productModel
      .findById(id)
      .select("title description price stock image category")
      .populate("category");

    if (!foundProduct) {
      throw new Error("Invalid Product ID!");
    }

    return res.json({
      message: "Product Found Successfully!",
      product: foundProduct,
    });
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/products/:id", userAuth, async (req, res, next) => {
  try {
    const { title, description, price, stock, image, category } = req.body;

    const { id } = req.params;
    validateMongoID(id);

    const isAdmin = req.user.role === "admin" ? true : false;
    if (!isAdmin) {
      throw new Error("You aren't Authorized to update products!");
    }

    const foundProduct = await productModel.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        price: price,
        stock: stock,
        image: image,
        category: category,
      },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Product Updated Successfully!",
    });
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/products/:id", userAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    validateMongoID(id);

    const foundProduct = await productModel.findByIdAndDelete(id);

    return res.json({
      message: "Product deleted Successfully!",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = productsRouter;
