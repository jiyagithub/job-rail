import express from "express";
import pool from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import deadLetterRoutes from "./routes/deadLetterRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/dead-letter-jobs", deadLetterRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to JobRail Backend 🚀");
});

app.post("/test", (req, res) => {
  console.log(req.body);

  res.json({
    message: "Data received successfully",
    data: req.body,
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message || String(error),
    });
  }
});

export default app;
