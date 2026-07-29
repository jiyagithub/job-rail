import pool from "../config/db.js";

export const createOrganization = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Organization name is required"
            });
        }

        const newOrganization = await pool.query(
            `INSERT INTO organizations (name, description, owner_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description || null, req.user.id]
        );

        res.status(201).json({
            message: "Organization created successfully",
            organization: newOrganization.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getOrganizations = async (req, res) => {
    try {
        const organizations = await pool.query(
            `SELECT *
             FROM organizations
             WHERE owner_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            message: "Organizations fetched successfully",
            organizations: organizations.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};