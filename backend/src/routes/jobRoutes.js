import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createJob,
    getJobs,
    getJobById,
    getJobLogs,
    getJobExecutions
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", protect, getJobs);
router.get("/:id", protect, getJobById);
router.get("/:id/logs", protect, getJobLogs);
router.get("/:id/executions", protect, getJobExecutions);

export default router;