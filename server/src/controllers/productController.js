const { buildKey } = require("../utils/keyGenerator");
const { getCache, setCache, removeCache } = require("../utils/cache");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

async function addProduct(req, res, next) {
  try {
    validateProductsData(req);

    const product = await createProduct(req.body);

    await removeCache(buildKey("products:list"));

    return res.json({
      message: "Product created successfully!",
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function viewProducts(req, res, next) {
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

    const filters = req.query;
    const filteredProducts = (await getProducts(filters)).products;

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

    const Total = (await getProducts(filters)).total;
    const responseData = {
      message: "Filtered Products!",
      totalProducts: Total,
      totalPages: Math.ceil(Total / limit),
      page: Number(page),
      limit: Number(limit),
      products: filteredProducts,
    };

    await setCache(key, responseData, 60);

    return res.json(responseData);
  } catch (err) {
    next(err);
  }
}

async function viewProductsById(req, res, next) {
  try {
    const { id } = req.params;

    const key = buildKey("product:details", { id });
    const cachedProducts = await getCache(key);
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    const product = await getProductById(id);

    await setCache(key, foundProduct, 60);

    return res.json({
      message: "Product Found Successfully!",
      product,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProductsById(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body);

    await removeCache(buildKey("product:details", { id }));

    return res.json({
      message: "Product Updated Successfully!",
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await deleteProduct(id);

    await removeCache(buildKey("product:details", { id }));

    return res.json({
      message: "Product deleted Successfully!",
      product: product,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addProduct,
  viewProducts,
  viewProductsById,
  updateProductsById,
  deleteProductById,
};
