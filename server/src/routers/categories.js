const express = require("express");

const { categoriesModel } = require("../models/category");
const { userAuth } = require("../middleware/Auth");
const { userModel } = require("../models/user");
const {
  validateNewCategoriesData,
  validateMongoID,
} = require("../utils/validate");
const { json } = require("stream/consumers");

const categoriesRouter = express.Router();

categoriesRouter.post("/categories", userAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin" ? true : false;
    const { name } = req.body;

    validateNewCategoriesData(req);

    if (!isAdmin) {
      throw new Error("You are not authorised to Post categories!");
    } else {
      const category = new categoriesModel({
        name: name,
      });

      const savedCategory = await category.save();

      res.json({
        messege: "New category Created!",
        data: savedCategory,
      });
    }
  } catch (err) {
    next(err);
  }
});

categoriesRouter.get("/categories", userAuth, async (req, res, next) => {
  try {
    const categoriesNames = await categoriesModel.find().select("name");
    res.json({
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

    validateMongoID(id);
    validateNewCategoriesData(req);

    const categoryFoundOrNot = await categoriesModel.findById(id.toString());

    if (!categoryFoundOrNot) {
      throw new Error("Invalid MongoID!");
    }

    if (!isAdmin) {
      throw new Error("You are not authorised to Post categories!");
    }

    const foundCategory = await categoriesModel.findByIdAndUpdate(id, {
      name: name,
    });

    const newCategory = await foundCategory.save();

    res.json({
      messege: "Category Modified Successfully! ",
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

    const deleteCategory = await categoriesModel.deleteOne({
      _id: id.toString(),
    });

    res.json({
      messege: "Category Deleted Successfully! ",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = categoriesRouter;
