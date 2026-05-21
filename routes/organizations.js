const express = require('express');
const router = express.Router();
const { empresaModels } = require('../models');
const authMiddleware = require('../middleware/session');
const { Op } = require('sequelize');

// Helper to parse Loopback filter for organizations
function parseOrganizationsFilter(req) {
    let whereClause = {};
    let filterObj = {};

    if (req.query.filter) {
        try {
            filterObj = typeof req.query.filter === 'string' ? JSON.parse(req.query.filter) : req.query.filter;
            if (filterObj.where) {
                whereClause = filterObj.where;
            }
        } catch (e) {
            console.error("Error parsing req.query.filter in organizations:", e);
        }
    }

    let id = null;

    if (whereClause.id) {
        id = whereClause.id;
    }

    return { id, filterObj };
}

// Map database Sequelize Empresa model to Loopback JSON expected by frontend
function mapEmpresaToFrontend(empresa) {
    const json = empresa.toJSON ? empresa.toJSON() : empresa;
    return {
        id: json.emp_id,
        name: json.emp_nombre || "",
        email: json.emp_email || "",
        status: json.emp_estado || "active",
        cost: json.emp_costo || 0,
        createdAt: json.emp_created_at || null,
        updatedAt: json.emp_updated_at || null
    };
}

// GET /api/organizations
router.get("/", authMiddleware(['all']), async (req, res) => {
    try {
        const { id } = parseOrganizationsFilter(req);

        const where = {};

        if (id) {
            where.emp_id = id;
        }

        const data = await empresaModels.findAll({ where });
        const mappedData = data.map(mapEmpresaToFrontend);
        res.send(mappedData);
    } catch (error) {
        console.error("Error fetching organizations compatibility layer:", error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
