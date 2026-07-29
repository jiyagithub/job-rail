import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDeadLetterJobs } from "../controllers/deadLetterController.js";

const router = express.Router();

router.get("/", protect, getDeadLetterJobs);

export default router;