const { matchedData } = require('express-validator');
const { formularioOrganizationModels } = require('../models');
const { httpError } = require('../utils/handleError');
const jwt = require('jsonwebtoken');

// const getItems = async (req, res) => {
//     try {
//         //findAll para sequelize y find para mongoose
//         const {id: sub, name} = {id: 'AdminForm', name: 'Steng'};
//         const token = jwt.sign({
//             sub,
//             name,
//             exp: Date.now() + 60 * 1000,
//         }, 'secretoForm')
//         if(token){
//             const data = await formularioOrganizationModels.findAll({});
//             res.send({data});
//         }
//     } catch (error) {
//         httpError(res, "ERROR_GET_ITEM_FORM");
//     }
// };

const getItems = async (req, res) => {
    try {
        const data = await formularioOrganizationModels.findAll({});
        res.send({data});
    } catch (error) {
        res.status(401).send({error: error.message})
    }
};
const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {form_id} = req
        const data = await formularioOrganizationModels.findByPk(form_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_FORMORGANIZATION")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await formularioOrganizationModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, `ERROR_CREATE_FORMORGANIZATION`)
    }

};

const updateItem = async (req, res) => {
    // try {
    //     const { body } = req
    //     const data = await formularioOrganizationModels.update(
    //         {
    //             //data a cambiar
    //             nombre : body.nombre,
    //             cantidadViajes : (body.cantidadViajes)+1
    //         },
    //         {
    //             //Identificador
    //             where: { form_id : body.form_id },
    //         }
    //     )
    //     res.send('Item Update Complete');
    // } catch (error) {
    //     httpError(res, "ERROR_UPDATE_FORM");
    // }
};

const deleteItem = async (req, res) => {
    try {
        const {form_id} = req.params
        const data = await formularioOrganizationModels.destroy({
            where: { form_id: form_id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_FORMORGANIZATION")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
