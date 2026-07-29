import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createQueue,
    getQueues,
    updateQueueStatus,
    getQueueAnalytics
} from "../controllers/queueController.js";

const router = express.Router();

router.post("/", protect, createQueue);
router.get("/", protect, getQueues);
router.patch("/:id/status", protect, updateQueueStatus);
router.get("/:id/analytics", protect, getQueueAnalytics);

export default router;