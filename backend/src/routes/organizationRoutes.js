import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createOrganization,
    getOrganizations
} from "../controllers/organizationController.js";

const router = express.Router();

router.post("/", protect, createOrganization);
router.get("/", protect, getOrganizations);

export default router;