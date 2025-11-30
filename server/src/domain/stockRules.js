function hasSufficientStock(currnet, requested) {
  return currnet >= requested;
}

function cannotGoNegative(newStock) {
  return newStock >= 0;
}

module.exports = {
  hasSufficientStock,
  cannotGoNegative,
};
