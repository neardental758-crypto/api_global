const { matchedData } = require('express-validator');
const { teoricaModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    let filtro = {};
    try {
        filtro = req.query && req.query.filter ? JSON.parse(req.query.filter) : {};
    } catch (e) {
        filtro = {};
    }
    const organizationRaw = filtro.organizationId;
    const organization = (organizationRaw !== undefined && organizationRaw !== null && !isNaN(Number(organizationRaw)))
        ? Number(organizationRaw)
        : organizationRaw;

    try {
        const empresa = organization ? await Empresa.findByPk(String(organization)) : null;
        const empresaNombre = empresa && empresa.emp_nombre ? String(empresa.emp_nombre) : null;
        const data = await teoricaModels.findAll({
            include: [{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre'],
                where: organization
                    ? {
                        usu_empresa: {
                            [Op.or]: [String(organization), ...(empresaNombre ? [empresaNombre] : [])],
                        },
                    }
                    : undefined,
                required: true
            }]
        });
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_TEORICA");
    }
};

const getItem = async (req, res) => {
    try {
        req = req.params
        const { _id } = req
        const user = await usuarioModels.findByPk(_id);
        const data = await teoricaModels.findAll({
            include: [{
                model: Usuario,
                attributes: ['usu_documento', 'usu_nombre', 'usu_created_at'],
            }],
            where: {
                teorica_usuario: _id,
                teorica_resultado: 'APROBO'
            }
        });
        // Comparar convirtiendo a objetos Date
        const creationDate = new Date(user.usu_created_at);
        const cutoffDate = new Date("2024-07-01T00:00:00.000Z");

        if (creationDate < cutoffDate) {
            res.send({ "data": ["Es", "usuario", "antiguo"] });
        } else {
            res.send({ data });
        }
    } catch (e) {
        httpError(res, `ERROR_GET_ITEM_TEORICA`)
    }
};


const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await teoricaModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_TEORICA")
    }

};

const updateItem = async (req, res) => {
    // try {
    //     const { body } = req
    //     const data = await teoricaModels.update(
    //         {
    //             res_estado: body.estado,
    //         },
    //         {
    //             where: { res_id : body.res_id },
    //         }
    //     )
    //     res.send('ok');
    // } catch (error) {
    //     httpError(res, "ERROR_UPDATE_TEORICA");
    // }
};

const deleteItem = (req, res) => { };

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
