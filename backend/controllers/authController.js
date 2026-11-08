import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { nextCustomerId } from "../services/idService.js";
import { validateEmailDomain } from "../services/emailValidation.js";
import { hasAdminAccess, isReservedAdminEmail } from "../utils/adminAccess.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const register = async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();
    const postalCode = String(req.body.postalCode || "").trim();
    const country = String(req.body.country || "").trim();

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!username || !email || !password || !phone || !postalCode || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isReservedAdminEmail(email)) {
      return res.status(400).json({ message: "This email address cannot be used for registration" });
    }

    const domainValidation = await validateEmailDomain(email);
    if (!domainValidation.valid) {
      return res.status(400).json({ message: domainValidation.reason });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account already exists for this email address" });
    }

    const user = new User({
      username,
      email,
      password,
      phone,
      postalCode,
      country,
      emailVerified: false,
      customerId: await nextCustomerId(),
    });

    await user.save();

    res.status(201).json({
      message: "Account created successfully",
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: false,
      token: generateToken(user._id),
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: "An account already exists for this email address" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const isAdmin = hasAdminAccess(user);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "customer",
        isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
