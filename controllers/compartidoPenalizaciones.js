const { matchedData } = require('express-validator');
const { compartidoPenalizacionModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const ViajeActivo = require('../models/mysql/compartidoViajeActivo');


const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoPenalizacionModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOPENALIZACION");
    }
};
const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoPenalizacionModels.findAll({
            include : [{
                model : Usuario,
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                        where : {
                            emp_id : organizationId
                        }
                  }],
                  required: true
            },{
                model : ViajeActivo,
                attributes : ['fecha'],
            }]
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOPENALIZACION");
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoPenalizacionModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOPENALIZACION")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPenalizacionModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOPENALIZACION")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoPenalizacionModels.update(
            {
                //data a cambiar
            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOPENALIZACION");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoPenalizacionModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoPenalizacionModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update COMPARTIDOPENALIZACION"
            });
        }else{
            res.json({
                message: "Update COMPARTIDOPENALIZACION failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOPENALIZACION `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoPenalizacionModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOPENALIZACION")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsFilterOrganization
}
