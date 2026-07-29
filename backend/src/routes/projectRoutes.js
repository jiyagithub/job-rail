import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createProject,
    getProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);

export default router;