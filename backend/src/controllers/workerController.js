import pool from "../config/db.js";

export const getWorkers = async (req, res) => {
  try {
    const workers = await pool.query(
      `SELECT *
       FROM workers
       ORDER BY id`
    );

    res.json({
      message: "Workers fetched successfully",
      workers: workers.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};