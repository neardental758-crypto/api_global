const { matchedData } = require('express-validator');
const { compartidoComentariosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Usuario = require('../models/mysql/usuario');
const Empresa = require('../models/mysql/empresa');
const ViajeActivo = require('../models/mysql/compartidoViajeActivo');

const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await compartidoComentariosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_COMPARTIDOCOMENTARIO");
    }
};

const getItemsFilterOrganization = async (req, res) => {
    req = matchedData(req)
    const { organizationId } = req
    try {
        const data = await compartidoComentariosModels.findAll({
            include : [{
                model : Usuario,
                as : "usuarioEnviado",
                attributes : ['usu_documento', 'usu_nombre'],
                include:[{
                    model: Empresa,
                    attributes: ['emp_id'],
                    where : {
                        emp_id : organizationId
                    }
                  }],
                  required: true
            },
            {   model : Usuario,
                as : "usuarioRecibido",
                attributes : ['usu_documento', 'usu_nombre'],
            },
            {   model : ViajeActivo,
                as : "comentariosRelacionados",
                attributes : ['fecha'],
            }],
        }
    );
        res.send({data});
    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOCOMENTARIO ${error}`);
    }
};

const getItemsIdCalificacion = async (req, res) => {
    try {
        req = matchedData(req)
        const {idCalificacion} = req
        const data = await compartidoComentariosModels.findAll({
            where: { idCalificacion: idCalificacion }
        });
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_IDCALIFICACION");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {_id} = req
        const data = await compartidoComentariosModels.findByPk(_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_COMPARTIDOCOMENTARIO")
    }
};

const createItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoComentariosModels.create(body)
        res.send('Item Create Complete')
    } catch (error) {
        httpError(res, `ERROR_CREATE_COMPARTIDOCOMENTARIO ${error}`)
    }

};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await compartidoComentariosModels.update(
            {
                //data a cambiar
                nombre : body.nombre,
                cantidadViajes : (body.cantidadViajes)+1
            },
            {
                //Identificador
                where: { _id : body._id },
            }
        )
        res.send('Item Update Complete');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_COMPARTIDOCOMENTARIO");
    }
};

const patchItem = async (req, res) => {
    const objetoACambiar = req.body;
    const _id = req.params._id;
    try {
        const data = await compartidoComentariosModels.update(
        objetoACambiar,
        {
            where: { _id: _id }
        })
        let actual = await compartidoComentariosModels.findByPk(_id);
        if(actual != null){
            res.status(200).json({
                status:200,
                data: actual,
                message: "Update COMPARTIDOCOMENTARIO"
            });
        }else{
            res.json({
                message: "Update COMPARTIDOCOMENTARIO failed"
            });
        }

    } catch (error) {
        httpError(res, `ERROR_UPDATE_COMPARTIDOCOMENTARIO `);
    }
};

const deleteItem = async (req, res) => {
    try {
        const {_id} = req.params
        const data = await compartidoComentariosModels.destroy({
            where: { _id: _id }
        });
        res.send("Item Delete Complete");
    } catch (e) {
        httpError(res, "ERROR_DELETE_COMPARTIDOCOMENTARIO")
    }
};

module.exports = {
    getItems, getItem, createItem, updateItem, patchItem, deleteItem, getItemsIdCalificacion, getItemsFilterOrganization
}