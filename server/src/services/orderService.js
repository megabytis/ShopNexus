const { default: mongoose } = require("mongoose");

const { orderModel } = require("../models/order");
const { userModel } = require("../models/user");
const { productModel } = require("../models/product");
const { validateMongoID, validateOrderStatus } = require("../utils/validate");

async function getPersonalOrders(userId, page = 1, limit = 10) {
  if (!userId) {
    throw new Error("userID not found!");
  }
  validateMongoID(userId);

  const skip = (page - 1) * limit;

  const totalOrders = await orderModel.countDocuments({ userId: userId });
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await orderModel
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    message: "Orders fetched!",
    totalOrders,
    totalPages,
    currentPage: page,
    limit,
    orders,
  };
}

async function getOrderById(user, orderId) {
  if (!orderId) {
    throw new Error("userID not found!");
  }
  validateMongoID(orderId);

  const foundOrder = await orderModel.findById(orderId);
  if (!foundOrder) {
    throw new Error("Order not found!");
  }

  const isOwnerOfTheOrderId =
    foundOrder.userId.toString() === user._id.toString();
  if (!isOwnerOfTheOrderId && user.role.toString() !== "admin") {
    throw new Error("Access Denied! You can't view this order!");
  }

  return foundOrder;
}

async function getOrderByFilter(filter) {
  let {
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
  } = filter;

  const orderQuery = {};

  // ---------------MIN-MAX FILTER----------------
  // imp: converting both min, max to Number before inserting it to query

  if (min && max) {
    min = Number(min);
    max = Number(max);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      orderQuery.totalAmount = {
        $gte: min,
        $lte: max,
      };
    }
  } else if (min) {
    min = Number(min);
    if (!Number.isNaN(min)) {
      orderQuery.totalAmount = {
        $gte: min,
      };
    }
  } else if (max) {
    max = Number(max);
    if (!Number.isNaN(max)) {
      orderQuery.totalAmount = {
        $lte: max,
      };
    }
  }

  // --------------orderStatus FIlter--------------
  // logic: assign the value if EXISTS and VALID otherwise leave it
  const validOrderStatus = ["processing", "shipped", "delivered", "cancelled"];

  if (orderStatus && validOrderStatus.includes(orderStatus)) {
    orderQuery.orderStatus = orderStatus;
  }

  // ----------paymentStatus Filter---------------
  // logic is same like order Status
  const validatePaymentStatus = ["paid", "pending", "failed"];

  if (paymentStatus && validatePaymentStatus.includes(paymentStatus)) {
    orderQuery.paymentStatus = paymentStatus;
  }

  // -----------------userId Filter-----------------
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const isUserIdValid = await userModel.findById(userId.toString());
    if (isUserIdValid) {
      orderQuery.userId = userId;
    }
  }

  // ----------------productId Filter-------------------------
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    const isValidProductId = await productModel.findById(productId.toString());
    if (isValidProductId) {
      orderQuery["items.productId"] = new mongoose.Types.ObjectId(productId);
    }
  }

  // -------------FROM-TO Filter-------------------
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    if (fromDate <= toDate && !isNaN(fromDate) && !isNaN(toDate)) {
      orderQuery.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }
  } else if (from) {
    orderQuery.createdAt = {
      $gte: new Date(from),
    };
  } else if (to) {
    let toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    orderQuery.createdAt = {
      $lte: new Date(toDate),
    };
  }

  // ---------------SORT-BY & ORDER FILTER-------------------
  let finalSortField;
  const allowedfinalSortFields = [
    "createdAt",
    "totalAmount",
    "orderStatus",
    "paymentStatus",
  ];
  if (sortBy && allowedfinalSortFields.includes(sortBy)) {
    finalSortField = sortBy.toString();
  } else {
    finalSortField = "createdAt";
  }

  let finalSortDirection;
  if (order === "asc") {
    finalSortDirection = 1;
  } else if (order === "desc") {
    finalSortDirection = -1;
  } else {
    finalSortDirection = -1;
  }

  const sortObject = { [finalSortField]: finalSortDirection };

  // --------------PAGE FILTER-----------
  page = parseInt(page) || 1;

  const MAX_LIMIT = 5;
  limit = parseInt(limit) || MAX_LIMIT;
  limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;

  const skip = (page - 1) * limit;

  const totalOrders = await orderModel.countDocuments(orderQuery);
  const totalPages = Math.ceil(totalOrders / limit);

  if (page > totalPages && totalPages > 0) {
    throw new Error("Page is not available!");
  }

  const allOrders = await orderModel
    .find(orderQuery)
    .sort(sortObject)
    .skip(skip)
    .limit(limit);

  return { orders: allOrders, totalOrders, totalPages };
}

async function updateOrderStatusById(orderId, status) {
  if (!orderId) {
    throw new Error("OrderID not found!");
  }
  validateMongoID(orderId);
  validateOrderStatus(status);

  const foundOrder = await orderModel.findById(orderId);
  if (!foundOrder) {
    throw new Error("Order not found");
  }

  const updatedOrderStatus = await orderModel.findByIdAndUpdate(
    orderId,
    {
      orderStatus: status.toString(),
    },
    { new: true }
  );

  return updatedOrderStatus;
}

module.exports = {
  getPersonalOrders,
  getOrderById,
  getOrderByFilter,
  updateOrderStatusById,
};
