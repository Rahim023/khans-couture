// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hasAdminAccess } from "../utils/adminAccess.js";

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
  if (!hasAdminAccess(req.user)) return res.status(403).json({ message: "Admin access required" });
  next();
};
export default protect;
