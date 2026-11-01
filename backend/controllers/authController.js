import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { nextCustomerId } from "../services/idService.js";
import { sendOTPVerificationEmail } from "../services/emailService.js";
import { validateEmailDomain } from "../services/emailValidation.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const hashVerificationCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");
const createVerificationCode = () => String(crypto.randomInt(100000, 1000000));
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

    const domainValidation = await validateEmailDomain(email);
    if (!domainValidation.valid) {
      return res.status(400).json({ message: domainValidation.reason });
    }

    if (!username || !email || !password || !phone || !postalCode || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing?.emailVerified) {
      return res.status(400).json({ message: "An account already exists for this email address" });
    }

    const code = createVerificationCode();
    const verificationData = {
      emailVerificationCode: hashVerificationCode(code),
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      emailVerified: false,
    };

    const user = existing || new User({
      username,
      email,
      password,
      phone,
      postalCode,
      country,
      customerId: await nextCustomerId(),
    });

    if (existing) {
      user.username = username;
      user.password = password;
      user.phone = phone;
      user.postalCode = postalCode;
      user.country = country;
    }
    Object.assign(user, verificationData);
    await user.save();

    await sendOTPVerificationEmail(email, code, username);
    res.status(201).json({
      message: "Verification code sent to your email address",
      email,
      requiresVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    if (!EMAIL_PATTERN.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Enter your email and the 6-digit verification code" });
    }

    const user = await User.findOne({ email, emailVerified: false });
    if (!user) {
      return res.status(400).json({ message: "No pending verification found for this email address" });
    }
    if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired. Request a new code." });
    }
    if (user.emailVerificationCode !== hashVerificationCode(code)) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      message: "Email verified successfully",
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || "customer",
      isAdmin: user.role === "admin",
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email, emailVerified: false });
    if (!user) {
      return res.status(400).json({ message: "No pending email verification found" });
    }

    const code = createVerificationCode();
    user.emailVerificationCode = hashVerificationCode(code);
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPVerificationEmail(email, code, user.username);

    res.json({ message: "A new verification code was sent to your email address" });
  } catch (err) {
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
    if (user && !user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before signing in",
        requiresVerification: true,
        email,
      });
    }

    if (user && (await user.matchPassword(password))) {
      const adminEmails = String(process.env.ADMIN_EMAILS || "")
        .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
      const isAdmin = user.role === "admin" ||
        adminEmails.includes(String(user.email || "").toLowerCase());
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
