import pool from "../config/db.js";

export const createQueue = async (req, res) => {
    try {
        const {
            name,
            description,
            project_id,
            priority,
            concurrency_limit
        } = req.body;

        if (!name || !project_id) {
            return res.status(400).json({
                message: "Queue name and project_id are required"
            });
        }

        const projectCheck = await pool.query(
            `SELECT p.id
             FROM projects p
             JOIN organizations o ON p.organization_id = o.id
             WHERE p.id = $1
             AND o.owner_id = $2`,
            [project_id, req.user.id]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found or not owned by user"
            });
        }

        const newQueue = await pool.query(
            `INSERT INTO queues
             (
                name,
                description,
                project_id,
                priority,
                concurrency_limit
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                name,
                description || null,
                project_id,
                priority ?? 0,
                concurrency_limit ?? 5
            ]
        );

        res.status(201).json({
            message: "Queue created successfully",
            queue: newQueue.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getQueues = async (req, res) => {
    try {
        const { project_id } = req.query;

        if (!project_id) {
            return res.status(400).json({
                message: "project_id is required"
            });
        }

        const queues = await pool.query(
            `SELECT q.*
             FROM queues q
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE q.project_id = $1
             AND o.owner_id = $2
             ORDER BY q.created_at DESC`,
            [project_id, req.user.id]
        );

        res.json({
            message: "Queues fetched successfully",
            queues: queues.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateQueueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "paused"].includes(status)) {
            return res.status(400).json({
                message: "Status must be active or paused"
            });
        }

        const queueCheck = await pool.query(
            `SELECT q.id
             FROM queues q
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE q.id = $1
             AND o.owner_id = $2`,
            [id, req.user.id]
        );

        if (queueCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Queue not found or not owned by user"
            });
        }

        const updatedQueue = await pool.query(
            `UPDATE queues
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        res.json({
            message: `Queue ${status} successfully`,
            queue: updatedQueue.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getQueueAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const queueCheck = await pool.query(
            `SELECT q.id
             FROM queues q
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE q.id = $1
             AND o.owner_id = $2`,
            [id, req.user.id]
        );

        if (queueCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Queue not found or not owned by user"
            });
        }

        const analyticsResult = await pool.query(
            `SELECT
                COUNT(*) AS total_jobs,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending_jobs,
                COUNT(*) FILTER (WHERE status = 'running') AS running_jobs,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_jobs,
                COUNT(*) FILTER (WHERE status = 'failed') AS failed_jobs,
                COALESCE(SUM(retry_count), 0) AS total_retries,
                COALESCE(
                    AVG(
                        EXTRACT(
                            EPOCH FROM (completed_at - started_at)
                        )
                    ) FILTER (
                        WHERE status = 'completed'
                        AND started_at IS NOT NULL
                        AND completed_at IS NOT NULL
                    ),
                    0
                ) AS average_execution_seconds
             FROM jobs
             WHERE queue_id = $1`,
            [id]
        );

        const stats = analyticsResult.rows[0];

        const totalJobs = Number(stats.total_jobs);
        const completedJobs = Number(stats.completed_jobs);

        const successRate =
            totalJobs === 0
                ? 0
                : Number(
                    ((completedJobs / totalJobs) * 100).toFixed(2)
                );

        res.json({
            message: "Queue analytics fetched successfully",
            analytics: {
                queueId: Number(id),
                totalJobs,
                pendingJobs: Number(stats.pending_jobs),
                runningJobs: Number(stats.running_jobs),
                completedJobs,
                failedJobs: Number(stats.failed_jobs),
                totalRetries: Number(stats.total_retries),
                averageExecutionSeconds: Number(
                    Number(stats.average_execution_seconds).toFixed(2)
                ),
                successRate
            }
        });
    } catch (error) {
        console.error("Queue analytics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};