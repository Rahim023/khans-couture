// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    console.error("authMiddleware Error:", err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const requireAdmin = (req, res, next) => {
  const adminEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  const isAdmin = req.user?.role === "admin" ||
    (req.user?.email && adminEmails.includes(String(req.user.email).toLowerCase()));
  if (!isAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
};
export default protect;
