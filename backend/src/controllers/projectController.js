import pool from "../config/db.js";

export const createProject = async (req, res) => {
    try {
        const { name, description, organization_id } = req.body;

        if (!name || !organization_id) {
            return res.status(400).json({
                message: "Project name and organization_id are required"
            });
        }

        const organizationCheck = await pool.query(
            "SELECT * FROM organizations WHERE id = $1 AND owner_id = $2",
            [organization_id, req.user.id]
        );

        if (organizationCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found or not owned by user"
            });
        }

        const newProject = await pool.query(
            `INSERT INTO projects (name, description, organization_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description || null, organization_id]
        );

        res.status(201).json({
            message: "Project created successfully",
            project: newProject.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await pool.query(
            `SELECT p.*
             FROM projects p
             JOIN organizations o ON p.organization_id = o.id
             WHERE o.owner_id = $1
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );

        res.json({
            message: "Projects fetched successfully",
            projects: projects.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};