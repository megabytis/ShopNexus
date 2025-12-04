const { setCache, getCache, removeCache } = require("../utils/cache");
const { buildKey } = require("../utils/keyGenerator");

const {
  getPersonalOrders,
  getOrderById,
  getOrderByFilter,
  updateOrderStatusById,
} = require("../services/orderService");

async function getMyOrder(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const key = buildKey("orders:my", { userId: user._id, page, limit });
    const cachedOrders = await getCache(key);
    if (cachedOrders) {
      return res.json(cachedOrders);
    }

    const result = await getPersonalOrders(user._id, page, limit);

    await setCache(key, result, 60); // Cache for 60 seconds

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getPersonalOrderById(req, res, next) {
  try {
    const user = req.user;
    const orderId = req.params.id;

    const key = buildKey("order:details", { orderId: orderId });
    const cachedOrders = await getCache(key);
    if (cachedOrders) {
      return res.json({
        message: "Order fetched from cache!",
        order: cachedOrders,
      });
    }

    const order = await getOrderById(user, orderId);

    await setCache(key, order);

    return res.json({
      message: "Order Fetched!",
      order: order,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    let {
      page,
      limit,
      orderStatus, // "processing", "shipped", "delivered", "cancelled"
      paymentStatus, // "paid", "pending", "failed"
      min, // minimum totalAmount
      max, // maximum totalAmount
      from, // createdAt >= from
      to, // createdAt <= to
      userId, // filter orders of a specific user (admin use)
      productId, // filter orders containing a specific product
      sortBy, // field to sort (createdAt, totalAmount)
      order, // asc / desc
    } = req.query;

    const key = buildKey("orders", {
      page,
      limit,
      orderStatus,
      paymentStatus,
      min,
      max,
      from,
      to,
      userId,
      productId,
      sortBy,
      order,
    });

    const cachedResponse = await getCache(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const { orders, totalOrders, totalPages } = await getOrderByFilter(req.query);

    const responseData = {
      message: "All orders Fetched!",
      totalOrders: Number(totalOrders),
      totalPages: Number(totalPages),
      page: Number(page),
      limit: Number(limit),
      orders,
    };

    await setCache(key, responseData, 60);

    return res.json(responseData);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    const order = await updateOrderStatusById(id, orderStatus);

    const orderDetailsKey = buildKey("order:details", { orderId: id });
    const myOrdersKey = buildKey("orders:my", {
      userId: order.userId.toString(),
    });

    await removeCache(orderDetailsKey);
    await removeCache(myOrdersKey);

    res.json({
      message: "Order status Updated Successfully!",
      updatedOrder: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyOrder,
  getPersonalOrderById,
  getAllOrders,
  updateOrderStatus,
};
