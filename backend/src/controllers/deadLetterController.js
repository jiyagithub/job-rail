import pool from "../config/db.js";

export const getDeadLetterJobs = async (req, res) => {
    try {
        const deadLetterJobs = await pool.query(
            `SELECT dlj.*, q.name AS queue_name
             FROM dead_letter_jobs dlj
             JOIN queues q ON dlj.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1
             ORDER BY dlj.moved_at DESC`,
            [req.user.id]
        );

        res.json({
            message: "Dead letter jobs fetched successfully",
            deadLetterJobs: deadLetterJobs.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};