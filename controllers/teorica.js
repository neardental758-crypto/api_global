const { matchedData } = require('express-validator');
const { teoricaModels, usuarioModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');

const getItems = async (req, res) => {
    const filtro = JSON.parse(req.query.filter);
    const organization = filtro.organizationId;
    try {
        const data = await teoricaModels.findAll({
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organization
                    }
                  }],
                  required: true
            }]
        });
        res.send({data});
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
                attributes: ['usu_documento', 'usu_nombre', 'usu_creacion'],
            }],
            where : {
                teorica_usuario : _id,
                teorica_resultado : 'APROBO'
            }
        });
        // if(user.usu_creacion < "2024-10-25T00:00:00.000Z"){
        if(user.usu_creacion < "2024-12-24T00:00:00.000Z"){
            res.send({ "data" : ["Es", "usuario", "antiguo"] });
        }else{
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

const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
