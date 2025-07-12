import express from "express";
import { createSwap, getSwaps, updateSwapStatus } from "../controllers/swapController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", protect, createSwap);
router.get("/", protect, getSwaps);
router.put("/:id", protect, updateSwapStatus);

export default router;