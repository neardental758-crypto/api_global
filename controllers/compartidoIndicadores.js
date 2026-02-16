const { matchedData } = require('express-validator');
const { compartidoIndicadorModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoIndicadorModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOINDICADORES");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoIndicadorModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOINDICADORES")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoIndicadorModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOINDICADORES")
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoIndicadorModels.update(
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
        httpError(res, "ERROR_UPDATE_COMPARTIDOINDICADORES");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoIndicadorModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoIndicadorModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update COMPARTIDOINDICADORES"
            });
        }else{
            res.json({
                message: "Update COMPARTIDOINDICADORES failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOINDICADORES `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoIndicadorModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOINDICADORES")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem
}
