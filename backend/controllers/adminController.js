import crypto from "crypto";
import XLSX from "xlsx";
import Order from "../models/orders.js";
import Product from "../models/Products.js";
import User from "../models/User.js";
import CustomOrder from "../models/CustomOrder.js";
import { nextCustomerId, nextOrderId } from "../services/idService.js";
import { uploadImages } from "../services/imageUpload.js";

const cleanText = (value) => String(value ?? "").trim();

export const getAdminOverview = async (req, res) => {
  try {
    const [orders, products, users, customOrders, revenueRows] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      CustomOrder.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$totalINR" } } },
      ]),
    ]);
    const pendingOrders = await Order.countDocuments({ status: { $in: ["Ordered", "Processing"] } });
    res.json({
      orders,
      products,
      users,
      customOrders,
      pendingOrders,
      revenue: revenueRows[0]?.revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "username email phone").sort({ createdAt: -1 });
  res.json(orders);
};

export const getAdminProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

export const getAdminCustomOrders = async (req, res) => {
  const orders = await CustomOrder.find().sort({ createdAt: -1 });
  res.json(orders);
};

export const getAdminUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  res.json(users);
};

export const updateAdminUserRole = async (req, res) => {
  const role = cleanText(req.body.role);
  if (!["customer", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const deleteAdminUser = async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true });
};

export const createAdminProduct = async (req, res) => {
  try {
    const { title, category, price, stock, description, section, trending } = req.body;
    if (!cleanText(title) || !cleanText(category) || Number(price) < 0) {
      return res.status(400).json({ message: "Title, category, and a valid price are required" });
    }
    if (!req.file) return res.status(400).json({ message: "Please upload a product photo" });
    const [imageUrl] = await uploadImages([req.file], "khans_couture/products");
    const product = await Product.create({
      _id: cleanText(req.body.id) || crypto.randomUUID(),
      title: cleanText(title),
      category: cleanText(category),
      description: cleanText(description),
      img: imageUrl,
      price: Number(price),
      stock: Math.max(0, Number(stock || 0)),
      rating: Math.max(0, Number(req.body.rating || 0)),
      trending: Boolean(trending),
      section: ["kurti", "wedding", "signature", "discover"].includes(section) ? section : "discover",
      sections: Array.isArray(req.body.sections) ? req.body.sections : [],
      Men: Boolean(req.body.Men),
      Women: Boolean(req.body.Women),
      Wedding: Boolean(req.body.Wedding),
      Signature: Boolean(req.body.Signature),
      Discover: Boolean(req.body.Discover),
      Western: Boolean(req.body.Western),
      Indian: Boolean(req.body.Indian),
      kurti: Boolean(req.body.kurti),
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;
    delete updates.img;
    if (req.file) {
      const [imageUrl] = await uploadImages([req.file], "khans_couture/products");
      updates.img = imageUrl;
    }
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Math.max(0, Number(updates.stock));
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAdminProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ success: true });
};

export const updateAdminOrder = async (req, res) => {
  const allowed = ["Ordered", "Processing", "Shipped", "Delivered"];
  const status = cleanText(req.body.status);
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid order status" });
  const updates = { status, cancelledAt: undefined, cancelledReason: undefined };
  const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const updateAdminCustomOrder = async (req, res) => {
  const allowed = ["Pending", "In Progress", "Completed"];
  if (req.body.status && !allowed.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid custom order status" });
  }
  const updates = { ...req.body, cancelledAt: undefined, cancelledReason: undefined };
  const order = await CustomOrder.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: "Custom order not found" });
  res.json(order);
};

export const createAdminOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items } = req.body;
    if (!customer?.name || !customer?.email || !customer?.phone) return res.status(400).json({ message: "Customer name, email, and phone are required" });
    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) return res.status(400).json({ message: "Complete shipping address is required" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "At least one item is required" });

    let user = await User.findOne({ email: cleanText(customer.email).toLowerCase() });
    if (!user) {
      user = await User.create({
        username: cleanText(customer.name),
        email: cleanText(customer.email).toLowerCase(),
        password: crypto.randomBytes(16).toString("hex"),
        phone: cleanText(customer.phone),
        postalCode: cleanText(shippingAddress.postalCode),
        country: cleanText(shippingAddress.country),
        customerId: await nextCustomerId(),
      });
    } else if (!user.customerId) {
      user.customerId = await nextCustomerId();
      await user.save();
    }

    const normalizedItems = items.map((item) => ({
      productId: cleanText(item.productId || item.id),
      title: cleanText(item.title),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      size: cleanText(item.size),
      img: cleanText(item.img),
    }));
    if (normalizedItems.some((item) => !item.productId || !item.title || item.price < 0 || item.quantity < 1 || !item.size)) {
      return res.status(400).json({ message: "Every item needs a product, title, size, positive quantity, and valid price" });
    }

    const totalINR = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      orderId: await nextOrderId(),
      user: user._id,
      customer: {
        userId: String(user._id),
        name: cleanText(customer.name),
        email: cleanText(customer.email).toLowerCase(),
        phone: cleanText(customer.phone),
        username: cleanText(customer.name),
      },
      shippingAddress: {
        firstName: cleanText(shippingAddress.firstName || shippingAddress.fullName || customer.name.split(" ")[0]),
        lastName: cleanText(shippingAddress.lastName || customer.name.split(" ").slice(1).join(" ") || "Customer"),
        addressLine1: cleanText(shippingAddress.addressLine1),
        addressLine2: cleanText(shippingAddress.addressLine2),
        city: cleanText(shippingAddress.city),
        state: cleanText(shippingAddress.state),
        postalCode: cleanText(shippingAddress.postalCode),
        country: cleanText(shippingAddress.country),
      },
      items: normalizedItems,
      totalINR,
      status: "Ordered",
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const appendWorkbookSheet = (workbook, sheetName, headers, dataRows, dataType) => {
  let rows = workbook.Sheets[sheetName]
    ? XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" })
    : [headers];

  if (rows.length) {
    const existingHeaders = rows[0].map((header) => cleanText(header));
    if (existingHeaders.length && existingHeaders.join("\u0000") !== headers.join("\u0000")) {
      throw new Error(`The "${sheetName}" sheet does not match the ${dataType} format.`);
    }
  } else {
    rows = [headers];
  }

  const existingKeys = new Set(rows.slice(1).map((row) => dataType === "customer"
    ? `customer:${cleanText(row[0])}`
    : `order:${cleanText(row[0])}|${cleanText(row[1])}|${cleanText(row[8])}|${cleanText(row[9])}|${cleanText(row[10])}`));
  const newRows = dataRows.filter((row) => {
    const key = dataType === "customer"
      ? `customer:${cleanText(row[0])}`
      : `order:${cleanText(row[0])}|${cleanText(row[1])}|${cleanText(row[8])}|${cleanText(row[9])}|${cleanText(row[10])}`;
    if (!cleanText(row[0]) || existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });
  rows.push(...newRows);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = headers.map((header) => ({ wch: Math.max(header.length + 2, 16) }));
  if (!workbook.SheetNames.includes(sheetName)) workbook.SheetNames.push(sheetName);
  workbook.Sheets[sheetName] = worksheet;
};

export const exportNewOrdersToWorkbook = async (req, res) => {
  try {
    const rawDataType = cleanText(req.body.dataType).toLowerCase();
    const dataType = ["all", "export all data", "export_all", "everything"].includes(rawDataType)
      ? "all"
      : ["customer", "customers"].includes(rawDataType)
        ? "customers"
        : ["order", "orders", "readymade", "custom"].includes(rawDataType)
          ? "orders"
          : rawDataType;
    const sheetName = cleanText(req.body.sheetName);
    if (!["customers", "orders", "all"].includes(dataType)) return res.status(400).json({ message: "Choose Customers, Orders, or Export All Data" });

    const requestedName = sheetName || (dataType === "orders" ? "Orders" : dataType === "customers" ? "Customers" : "Customers");
    if (requestedName.length > 31) return res.status(400).json({ message: "Sheet name must be 31 characters or fewer" });

    const workbook = req.file?.buffer
      ? XLSX.read(req.file.buffer, { type: "buffer", cellDates: true })
      : XLSX.utils.book_new();

    const customerHeaders = ["Customer ID", "Name", "Email", "Phone", "Role", "Country", "Postal Code", "Created At"];
    const customers = await User.find().sort({ createdAt: 1 }).lean();
    const customerRows = customers.map((customer) => [
      customer.customerId || "", customer.username || "", customer.email || "", customer.phone || "",
      customer.role || "customer", customer.country || "", customer.postalCode || "", customer.createdAt || "",
    ]);

    const orderHeaders = [
      "Order ID", "Order Type", "Order Date", "Customer ID", "Customer Name", "Email", "Phone", "Status",
      "Product / Outfit", "Size", "Quantity", "Unit Price", "Line Total", "Address", "City", "State",
      "Postal Code", "Country", "Delivery Date", "Fabric Preference", "Color", "Budget",
      "Special Instructions", "Reference Images",
    ];
    const orderRows = [];
    const normalOrders = await Order.find().sort({ createdAt: 1 }).lean();
    for (const order of normalOrders) {
      const address = order.shippingAddress || {};
      const addressText = [address.addressLine1, address.addressLine2].filter(Boolean).join(", ");
      const items = order.items?.length ? order.items : [null];
      for (const item of items) {
        orderRows.push([
          order.orderId || order._id, "Readymade", order.createdAt || "", order.customer?.customerId || "",
          order.customer?.name || "", order.customer?.email || "", order.customer?.phone || "", order.status || "",
          item?.title || "", item?.size || "", Number(item?.quantity || 0), Number(item?.price || 0),
          Number(item?.price || 0) * Number(item?.quantity || 0), addressText, address.city || "",
          address.state || "", address.postalCode || "", address.country || "", "", "", "", "", "",
        ]);
      }
    }
    const customOrders = await CustomOrder.find().sort({ createdAt: 1 }).lean();
    for (const order of customOrders) {
      orderRows.push([
        order.orderId || "", "Custom", order.createdAt || "", order.customerId || "", order.fullName || "",
        order.email || "", order.phone || "", order.status || "Pending", order.outfitType || "",
        "", "", "", "", order.address || "", "", "", "", "", order.deliveryDate || "",
        order.fabricPreference || "", order.color || "", order.budget || "",
        order.specialInstructions || "", (order.designImages || []).join(", "),
      ]);
    }

    if (dataType === "customers") {
      appendWorkbookSheet(workbook, requestedName, customerHeaders, customerRows, "customer");
    } else if (dataType === "orders") {
      appendWorkbookSheet(workbook, requestedName, orderHeaders, orderRows, "order");
    } else {
      appendWorkbookSheet(workbook, "Customers", customerHeaders, customerRows, "customer");
      appendWorkbookSheet(workbook, "Orders", orderHeaders, orderRows, "order");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename="Khan-Couture-${dataType}-${Date.now()}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to export workbook" });
  }
};
