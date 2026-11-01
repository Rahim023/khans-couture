import Sequence from "../models/Sequence.js";
import User from "../models/User.js";
import Order from "../models/orders.js";
import CustomOrder from "../models/CustomOrder.js";

const CUSTOMER_PREFIX = process.env.CUSTOMER_ID_PREFIX || "KC-1";
const ORDER_PREFIX = process.env.ORDER_ID_PREFIX || "ORD-1";

export const nextSequence = async (key) => {
  const sequence = await Sequence.findByIdAndUpdate(
    key,
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return sequence.value;
};

export const nextCustomerId = async () => {
  const value = await nextSequence("customer");
  return `${CUSTOMER_PREFIX}${String(value).padStart(4, "0")}`;
};

export const nextOrderId = async () => {
  const value = await nextSequence("order");
  return `${ORDER_PREFIX}${String(value).padStart(4, "0")}`;
};

export const backfillVisibleIds = async () => {
  const users = await User.find({ $or: [{ customerId: { $exists: false } }, { customerId: "" }] }).sort({ createdAt: 1 });
  for (const user of users) {
    user.customerId = await nextCustomerId();
    await user.save();
  }

  const standardOrders = await Order.find({ $or: [{ orderId: { $exists: false } }, { orderId: "" }] }).sort({ createdAt: 1 });
  const customOrders = await CustomOrder.find({ $or: [{ orderId: { $exists: false } }, { orderId: "" }] }).sort({ createdAt: 1 });
  const records = [
    ...standardOrders.map((record) => ({ record, kind: "standard" })),
    ...customOrders.map((record) => ({ record, kind: "custom" })),
  ].sort((a, b) => new Date(a.record.createdAt || 0) - new Date(b.record.createdAt || 0));

  for (const { record } of records) {
    record.orderId = await nextOrderId();
    await record.save();
  }
};
