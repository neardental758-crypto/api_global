const { matchedData } = require('express-validator');
const { compartidoVehiculoModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoVehiculoModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOVEHICULOS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoVehiculoModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOVEHICULOS")
    }
};
const getItemfilter = async (req, res) => {
    try {
        const { idpropietario } = req.params;
        const data = await compartidoVehiculoModels.findAll({
            where: { idpropietario : idpropietario}

          });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOVEHICULOS")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoVehiculoModels.create(body)
        res.send('ok')
    } catch (error) {
        httpError(res, "ERROR_CREATE_COMPARTIDOVEHICULOS")
    }
    
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoVehiculoModels.update(
            {
                marca : body.marca,
                modelo : body.modelo,
                color : body.color,
                placa : body.placa
            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOVEHICULOS");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoVehiculoModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoVehiculoModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "ok"
            });
        }else{
            res.json({
                message: "Update compartidoVehiculo failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOVehiculo`);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoVehiculoModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOVEHICULOS")
    }
};


module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemfilter
}
