function isValidOrder(items) {
  return Array.isArray(items) && items.length >= 0;
}

module.exports = {
  isValidOrder,
};
