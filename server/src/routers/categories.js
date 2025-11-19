const express = require("express");

const { categoriesModel } = require("../models/category");
const { userAuth } = require("../middleware/Auth");
const {
  validateNewCategoriesData,
  validateMongoID,
} = require("../utils/validate");

const categoriesRouter = express.Router();

categoriesRouter.post("/categories", userAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin" ? true : false;
    const { name } = req.body;

    validateNewCategoriesData(req);

    const availableCategory = await categoriesModel.findOne({
      name: name,
    });
    if (!availableCategory) {
      throw new Error("Category already exists!");
    }

    if (!isAdmin) {
      throw new Error("You are not authorised to Post categories!");
    }

    const category = new categoriesModel({
      name: name.trim().toLowerCase(),
    });
    const savedCategory = await category.save();

    res.json({
      message: "New category Created!",
      data: savedCategory,
    });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get("/categories", async (req, res, next) => {
  try {
    const categoriesNames = await categoriesModel.find().select("name");
    res.json({
      message: "Categories",
      data: categoriesNames,
    });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.put("/categories/:id", userAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin" ? true : false;
    const { name } = req.body;
    const { id } = req.params;

    if (!isAdmin) {
      throw new Error("You are not authorised to Post categories!");
    }
    validateMongoID(id);
    validateNewCategoriesData(req);

    const cat = await categoriesModel.findById(id);

    if (!cat) {
      throw new Error("Invalid MongoID!");
    }

    cat.name = name;
    await cat.save();

    res.json({
      message: "Category Modified Successfully! ",
      updatedCategory: cat,
    });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.delete("/categories/:id", userAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin" ? true : false;
    const { id } = req.params;

    if (!isAdmin) {
      throw new Error("You're not authorised to Delete categories!");
    }

    const categoryFoundOrNot = await categoriesModel.findById(id.toString());

    if (!categoryFoundOrNot) {
      throw new Error("Invalid MongoID!");
    }

    const deletedCategory = await categoriesModel.findByIdAndDelete({
      _id: id.toString(),
    });

    res.json({
      message: "Category Deleted Successfully! ",
      deletedCategory,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = categoriesRouter;
