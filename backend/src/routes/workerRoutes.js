import express from "express";
import { getWorkers } from "../controllers/workerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWorkers);

export default router;