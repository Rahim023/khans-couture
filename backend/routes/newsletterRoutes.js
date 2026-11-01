import express from "express";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import { validateEmailDomain } from "../services/emailValidation.js";
import {
  sendNewsletterWelcomeEmail,
  sendNewsletterAdminNotification,
} from "../services/emailService.js";

const router = express.Router();
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

router.post("/subscribe", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const domainValidation = await validateEmailDomain(email);
    if (!domainValidation.valid) {
      return res.status(400).json({ message: "This email address is not valid or does not exist" });
    }

    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      { $setOnInsert: { email } },
      { upsert: true, new: true }
    );

    await sendNewsletterWelcomeEmail(email);
    await sendNewsletterAdminNotification(email);

    return res.status(200).json({
      message: "Subscription successful. Check your email for the welcome message.",
      email,
    });
  } catch (error) {
    console.error("Newsletter subscription failed:", error.message);
    return res.status(500).json({ message: "Unable to send the subscription email. Please try again." });
  }
});

export default router;
