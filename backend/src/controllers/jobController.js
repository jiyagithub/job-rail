import pool from "../config/db.js";

export const createJob = async (req, res) => {
  try {
    const {
      queue_id,
      job_name,
      payload,
      priority,
      max_retries,
      job_type,
      delay_minutes,
      scheduled_at,
      recurrence_interval_minutes,
    } = req.body;

    if (!queue_id || !job_name) {
      return res.status(400).json({
        message: "queue_id and job_name are required",
      });
    }

    const validTypes = ["immediate", "delayed", "scheduled", "recurring"];
    const type = validTypes.includes(job_type) ? job_type : "immediate";

    let computedScheduledAt;
    let computedRecurrence = null;

    if (type === "immediate") {
      computedScheduledAt = new Date();
    } else if (type === "delayed") {
      const minutes = Number(delay_minutes) || 0;
      computedScheduledAt = new Date(Date.now() + minutes * 60 * 1000);
    } else if (type === "scheduled") {
      if (!scheduled_at) {
        return res.status(400).json({
          message: "scheduled_at is required for a scheduled job",
        });
      }
      computedScheduledAt = new Date(scheduled_at);
    } else if (type === "recurring") {
      const minutes = Number(recurrence_interval_minutes) || 0;
      if (minutes <= 0) {
        return res.status(400).json({
          message: "recurrence_interval_minutes must be greater than 0 for a recurring job",
        });
      }
      computedScheduledAt = new Date();
      computedRecurrence = minutes;
    }

    const queueCheck = await pool.query(
      `SELECT q.id
             FROM queues q
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE q.id = $1 AND o.owner_id = $2`,
      [queue_id, req.user.id],
    );

    if (queueCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Queue not found or not owned by user",
      });
    }

    const newJob = await pool.query(
      `INSERT INTO jobs
     (
        queue_id,
        job_name,
        payload,
        priority,
        max_retries,
        scheduled_at,
        job_type,
        recurrence_interval_minutes
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
      [
        queue_id,
        job_name,
        payload || {},
        priority ?? 0,
        max_retries ?? 3,
        computedScheduledAt,
        type,
        computedRecurrence,
      ],
    );

    res.status(201).json({
      message: "Job created successfully",
      job: newJob.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { queue_id } = req.query;

    if (!queue_id) {
      return res.status(400).json({
        message: "queue_id is required",
      });
    }

    const jobs = await pool.query(
      `SELECT j.*
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE j.queue_id = $1
             AND o.owner_id = $2
             ORDER BY j.priority DESC, j.created_at ASC`,
      [queue_id, req.user.id],
    );

    res.json({
      message: "Jobs fetched successfully",
      jobs: jobs.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getJobLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCheck = await pool.query(
      `SELECT j.id
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE j.id = $1 AND o.owner_id = $2`,
      [id, req.user.id],
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or not owned by user",
      });
    }

    const logs = await pool.query(
      `SELECT *
             FROM job_logs
             WHERE job_id = $1
             ORDER BY created_at ASC`,
      [id],
    );

    res.json({
      message: "Job logs fetched successfully",
      logs: logs.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getJobExecutions = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCheck = await pool.query(
      `SELECT j.id
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE j.id = $1 AND o.owner_id = $2`,
      [id, req.user.id],
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or not owned by user",
      });
    }

    const executions = await pool.query(
      `SELECT *
             FROM job_executions
             WHERE job_id = $1
             ORDER BY attempt_number ASC`,
      [id],
    );

    res.json({
      message: "Job executions fetched successfully",
      executions: executions.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await pool.query(
      `SELECT j.*
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             JOIN projects p ON q.project_id = p.id
             JOIN organizations o ON p.organization_id = o.id
             WHERE j.id = $1 AND o.owner_id = $2`,
      [id, req.user.id],
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or not owned by user",
      });
    }

    res.json({
      message: "Job fetched successfully",
      job: jobResult.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
