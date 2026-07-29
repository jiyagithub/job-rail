import pool from "../config/db.js";
import os from "os";

const sleep = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
};

const workerName = `${os.hostname()}-${process.pid}`;

let workerId = null;

const registerWorker = async () => {
    const result = await pool.query(
        `INSERT INTO workers
         (worker_name, status, last_heartbeat)
         VALUES ($1, 'online', CURRENT_TIMESTAMP)
         ON CONFLICT (worker_name)
         DO UPDATE SET
             status = 'online',
             last_heartbeat = CURRENT_TIMESTAMP
         RETURNING id`,
        [workerName]
    );

    workerId = result.rows[0].id;

    console.log(`Worker registered: ${workerName}`);
};

const sendHeartbeat = async () => {
    if (!workerId) {
        return;
    }

    await pool.query(
        `UPDATE workers
         SET status = 'online',
             last_heartbeat = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [workerId]
    );
};

const addJobLog = async (jobId, logLevel, message) => {
    await pool.query(
        `INSERT INTO job_logs (job_id, log_level, message)
         VALUES ($1, $2, $3)`,
        [jobId, logLevel, message]
    );
};

const getNextPendingJob = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT j.*
             FROM jobs j
             JOIN queues q ON j.queue_id = q.id
             WHERE j.status = 'pending'
             AND j.scheduled_at <= CURRENT_TIMESTAMP
             AND q.status = 'active'
             ORDER BY j.priority DESC, j.created_at ASC
             LIMIT 1
             FOR UPDATE OF j SKIP LOCKED`
        );

        if (result.rows.length === 0) {
            await client.query("COMMIT");
            return null;
        }

        const job = result.rows[0];

        const updatedJob = await client.query(
            `UPDATE jobs
             SET status = 'running',
                 started_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [job.id]
        );

        await client.query("COMMIT");

        return updatedJob.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const createExecutionRecord = async (job) => {
    const attemptNumber = job.retry_count + 1;

    const result = await pool.query(
        `INSERT INTO job_executions
         (job_id, attempt_number, status)
         VALUES ($1, $2, 'running')
         RETURNING id`,
        [job.id, attemptNumber]
    );

    return result.rows[0].id;
};

const markExecutionCompleted = async (executionId) => {
    await pool.query(
        `UPDATE job_executions
         SET status = 'completed',
             finished_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [executionId]
    );
};

const markExecutionFailed = async (executionId, errorMessage) => {
    await pool.query(
        `UPDATE job_executions
         SET status = 'failed',
             error_message = $1,
             finished_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [errorMessage, executionId]
    );
};

const markJobAsCompleted = async (jobId) => {
    await pool.query(
        `UPDATE jobs
         SET status = 'completed',
             completed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [jobId]
    );
};

const handleJobFailure = async (
    job,
    executionId,
    errorMessage
) => {
    await markExecutionFailed(executionId, errorMessage);

    await addJobLog(
        job.id,
        "ERROR",
        `Job attempt failed: ${errorMessage}`
    );

    const newRetryCount = job.retry_count + 1;

    if (newRetryCount <= job.max_retries) {
        await pool.query(
            `UPDATE jobs
             SET status = 'pending',
                 retry_count = $1,
                 started_at = NULL
             WHERE id = $2`,
            [newRetryCount, job.id]
        );

        await addJobLog(
            job.id,
            "WARNING",
            `Job scheduled for retry ${newRetryCount}/${job.max_retries}`
        );

        console.log(
            `Job ${job.id} failed. Retry ${newRetryCount}/${job.max_retries}`
        );
    } else {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `UPDATE jobs
                 SET status = 'failed',
                     retry_count = $1,
                     completed_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [newRetryCount, job.id]
            );

            await client.query(
                `INSERT INTO dead_letter_jobs
                 (
                    original_job_id,
                    queue_id,
                    job_name,
                    payload,
                    priority,
                    retry_count,
                    error_message
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    job.id,
                    job.queue_id,
                    job.job_name,
                    job.payload,
                    job.priority,
                    newRetryCount,
                    errorMessage
                ]
            );

            await client.query("COMMIT");

            await addJobLog(
                job.id,
                "ERROR",
                `Job moved to Dead Letter Queue after ${newRetryCount} attempts`
            );

            console.log(
                `Job ${job.id} moved to Dead Letter Queue: ${errorMessage}`
            );
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
};

const executeJob = async (job) => {
    await addJobLog(
        job.id,
        "INFO",
        "Job execution started"
    );

    await sleep(3000);

    const shouldFail = true;

    if (shouldFail) {
        throw new Error("Simulated job failure");
    }

    await addJobLog(
        job.id,
        "INFO",
        `Job payload processed: ${JSON.stringify(job.payload)}`
    );

    console.log("Executed job payload:", job.payload);
};

const processJob = async (job) => {
    console.log(`Starting job ${job.id}: ${job.job_name}`);
    console.log(`Job ${job.id} is running...`);

    await addJobLog(
        job.id,
        "INFO",
        `Worker claimed job: ${job.job_name}`
    );

    const executionId = await createExecutionRecord(job);

    try {
        await executeJob(job);

        await markJobAsCompleted(job.id);
        await markExecutionCompleted(executionId);

        await addJobLog(
            job.id,
            "INFO",
            "Job completed successfully"
        );

        console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
        await handleJobFailure(
            job,
            executionId,
            error.message
        );
    }
};

const startWorker = async () => {
    console.log("Job worker started");

    await registerWorker();

    setInterval(async () => {
        try {
            await sendHeartbeat();
        } catch (error) {
            console.error("Heartbeat error:", error);
        }
    }, 5000);

    while (true) {
        try {
            const job = await getNextPendingJob();

            if (job) {
                await processJob(job);
            } else {
                console.log("No pending jobs found");
            }
        } catch (error) {
            console.error("Worker error:", error);
        }

        await sleep(3000);
    }
};

startWorker();