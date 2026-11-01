// Only this version should exist
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function removeItem(cart, itemId) {
  return cart.filter(item => item.id !== itemId);
}
module.exports = { calculateTotal, removeItem };
