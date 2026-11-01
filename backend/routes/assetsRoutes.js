import express from "express";
import { getAssets, upsertAssets } from "../controllers/assetsController.js";

const router = express.Router();

router.get("/", getAssets);
router.post("/", upsertAssets);

export default router;
