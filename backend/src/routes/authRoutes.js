import express from "express";
import { registerUser, loginUser, updateName } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/name", protect, updateName);

export default router;