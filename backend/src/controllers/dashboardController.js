import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const jobStatsResult = await pool.query(
            `SELECT
                COUNT(*) AS total_jobs,
                COUNT(*) FILTER (WHERE j.status = 'pending') AS pending_jobs,
                COUNT(*) FILTER (WHERE j.status = 'running') AS running_jobs,
                COUNT(*) FILTER (WHERE j.status = 'completed') AS completed_jobs,
                COUNT(*) FILTER (WHERE j.status = 'failed') AS failed_jobs,
                COALESCE(SUM(j.retry_count), 0) AS total_retries
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1`,
            [userId]
        );

        const queueStatsResult = await pool.query(
            `SELECT
                COUNT(*) AS total_queues,
                COUNT(*) FILTER (WHERE q.status = 'active') AS active_queues,
                COUNT(*) FILTER (WHERE q.status = 'paused') AS paused_queues
             FROM queues q
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1`,
            [userId]
        );

        const projectStatsResult = await pool.query(
            `SELECT COUNT(*) AS total_projects
             FROM projects p
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1`,
            [userId]
        );

        const organizationStatsResult = await pool.query(
            `SELECT COUNT(*) AS total_organizations
             FROM organizations
             WHERE owner_id = $1`,
            [userId]
        );

        const recentJobsResult = await pool.query(
            `SELECT
                j.id,
                j.job_name,
                j.status,
                j.priority,
                j.retry_count,
                j.max_retries,
                j.created_at,
                q.name AS queue_name,
                p.name AS project_name,
                o.name AS organization_name
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1
             ORDER BY j.created_at DESC
             LIMIT 10`,
            [userId]
        );

        const jobStats = jobStatsResult.rows[0];
        const queueStats = queueStatsResult.rows[0];

        const totalJobs = Number(jobStats.total_jobs);
        const completedJobs = Number(jobStats.completed_jobs);

        const successRate =
            totalJobs === 0
                ? 0
                : Number(((completedJobs / totalJobs) * 100).toFixed(2));

        res.json({
            message: "Dashboard statistics fetched successfully",
            stats: {
                totalOrganizations: Number(
                    organizationStatsResult.rows[0].total_organizations
                ),
                totalProjects: Number(
                    projectStatsResult.rows[0].total_projects
                ),
                totalQueues: Number(queueStats.total_queues),
                activeQueues: Number(queueStats.active_queues),
                pausedQueues: Number(queueStats.paused_queues),
                totalJobs,
                pendingJobs: Number(jobStats.pending_jobs),
                runningJobs: Number(jobStats.running_jobs),
                completedJobs,
                failedJobs: Number(jobStats.failed_jobs),
                totalRetries: Number(jobStats.total_retries),
                successRate
            },
            recentJobs: recentJobsResult.rows
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};