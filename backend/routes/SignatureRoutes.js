import express from "express";
import {
  getAllSignatures,
  getSignatureById,
  getSignatureBySlug
} from "../controllers/SignatureController.js";

const router = express.Router();

// GET all
router.get("/", getAllSignatures);

// GET by slug FIRST
router.get("/slug/:slug", getSignatureBySlug);

// GET by ID
router.get("/:id", getSignatureById);

export default router;
