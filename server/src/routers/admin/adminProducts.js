const express = require("express");
const { userAuth } = require("../../middleware/Auth");
const { authorize } = require("../../middleware/Role");
const {
  addProduct,
  viewProducts,
  viewProductsById,
  updateProductsById,
  deleteProductById,
} = require("../../controllers/productController");
const upload = require("../../middleware/upload");
const {
  uploadProductImage,
} = require("../../controllers/adminProductController");

/*
POST   /admin/products         -> create product
GET    /admin/products         -> list all products
GET    /admin/products/:id     -> view product
PUT    /admin/products/:id     -> update product
DELETE /admin/products/:id     -> delete product

*/

const adminRouter = express.Router();

adminRouter.post("/", userAuth, authorize("admin"), addProduct);
adminRouter.get("/", userAuth, authorize("admin"), viewProducts);
adminRouter.get("/:id", userAuth, authorize("admin"), viewProductsById);
adminRouter.put("/:id", userAuth, authorize("admin"), updateProductsById);
adminRouter.delete("/:id", userAuth, authorize("admin"), deleteProductById);
adminRouter.post(
  "/upload-image",
  userAuth,
  authorize("admin"),
  upload.single("image"),
  uploadProductImage
);

module.exports = adminRouter;
