const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { usuarioModels } = require('../models');
const Estacion = require('../models/mysql/estacion');
const Extendido = require('../models/mysql/registroext');
const Agendados = require('../models/mysql/agendamientoUsuario');
const { Op } = require('sequelize');
const { createUserComplete, patchItem, deleteItem } = require('../controllers/usuario');

// Helper to translate LoopBack filters to Sequelize where clause
const translateFilter = (filter) => {
    let whereClause = {};
    if (!filter) return whereClause;
    
    const where = filter.where || filter;
    
    const translateCond = (cond) => {
        let seqCond = {};
        if (!cond || typeof cond !== 'object') return seqCond;
        
        for (const [key, val] of Object.entries(cond)) {
            let seqKey = key;
            // Map frontend fields to MySQL columns
            if (key === 'idNumber' || key === 'id') seqKey = 'usu_documento';
            if (key === 'email') seqKey = 'usu_email';
            if (key === 'name') seqKey = 'usu_nombre';
            if (key === 'roles') continue; // Ignore roles filtering
            
            if (key === 'or' && Array.isArray(val)) {
                seqCond[Op.or] = val.map(translateCond).filter(c => Object.keys(c).length > 0);
            } else if (key === 'and' && Array.isArray(val)) {
                seqCond[Op.and] = val.map(translateCond).filter(c => Object.keys(c).length > 0);
            } else if (val && typeof val === 'object') {
                const op = Object.keys(val)[0];
                const opVal = val[op];
                if (op === 'like') {
                    seqCond[seqKey] = { [Op.like]: `%${opVal}%` };
                } else if (op === 'eq') {
                    seqCond[seqKey] = opVal;
                } else if (op === 'inq') {
                    seqCond[seqKey] = { [Op.in]: opVal };
                }
            } else {
                seqCond[seqKey] = val;
            }
        }
        return seqCond;
    };
    
    return translateCond(where);
};

// GET /api/users
router.get('/', authMiddleware(["all"]), async (req, res) => {
    try {
        let filter = {};
        if (req.query.filter) {
            filter = JSON.parse(req.query.filter);
        }
        
        const whereClause = translateFilter(filter);
        
        // Always enforce organization ID if present in the filter
        let orgName = null;
        if (filter.where && filter.where.and) {
            const orgCond = filter.where.and.find(c => c.organizationId !== undefined);
            if (orgCond) {
                const org = await require('../models/mysql/empresa').findOne({
                    where: { emp_id: orgCond.organizationId }
                });
                if (org) {
                    orgName = org.emp_nombre;
                }
            }
        }
        
        if (orgName) {
            whereClause.usu_empresa = orgName;
        }

        const data = await usuarioModels.findAll({
            where: whereClause,
            include: [{
                model: Estacion,
                attributes: ['est_estacion', 'est_empresa', 'est_direccion'],
            },
            {
                model: Extendido,
                as: 'extendido'
            }, {
                model: Agendados,
                as: 'Agenda',
                where: {
                    agendado_resultado: 'APROBADO'
                },
                required: false
            }
            ],
            limit: filter.limit ? Number(filter.limit) : undefined,
            offset: filter.skip ? Number(filter.skip) : undefined,
            order: [['usu_documento', 'DESC']]
        });
        
        // Map Sequelize results to LoopBack format expected by the frontend
        const mappedUsers = data.map(user => {
            const val = user.toJSON ? user.toJSON() : user;
            return {
                id: val.usu_documento,
                idNumber: val.usu_documento,
                name: val.usu_nombre,
                firstLastname: val.usu_nombre ? val.usu_nombre.split(' ')[0] : '',
                secondLastname: val.usu_nombre ? val.usu_nombre.split(' ').slice(1).join(' ') : '',
                email: val.usu_email,
                phoneNumber: val.usu_telefono,
                organizationId: val.usu_empresa,
                usu_documento: val.usu_documento,
                usu_nombre: val.usu_nombre,
                usu_email: val.usu_email,
                usu_empresa: val.usu_empresa,
                usu_habilitado: val.usu_habilitado,
                usu_prueba: val.usu_prueba
            };
        });
        
        res.status(200).json(mappedUsers);
    } catch (error) {
        console.error("Error in GET /api/users:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/count
router.get('/count', authMiddleware(["all"]), async (req, res) => {
    try {
        let where = {};
        if (req.query.where) {
            where = JSON.parse(req.query.where);
        }
        
        const whereClause = translateFilter({ where });
        
        const count = await usuarioModels.count({
            where: whereClause
        });
        
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error in GET /api/users/count:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/users
router.post('/', authMiddleware(["all"]), createUserComplete);

// PATCH /api/users/:usu_documento
router.patch('/:usu_documento', authMiddleware(["all"]), patchItem);

// DELETE /api/users/:id
router.delete('/:id', authMiddleware(["all"]), deleteItem);

module.exports = router;
