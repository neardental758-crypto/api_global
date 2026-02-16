const { matchedData } = require('express-validator');
const { estacionModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');
const nombre_cortezza = 'Cortezza MDN';

const getItems = async (req, res) => {
    try {
      const data = await estacionModels.findAll({});
      res.send({ data });
    } catch (error) {
      console.error('Error en getItems:', error);
      res.status(500).send({ error: "ERROR_GET_ITEM_ESTACIONES___", details: error.message });
    }
  };

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {est_id} = req
        const data = await estacionModels.findByPk(est_id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_USER")
    }
};

const getItemNombre = async (req, res) => {
    try {
        req = matchedData(req)
        const { est_estacion } = req
        const data = await estacionModels.findAll({ where: { est_estacion: est_estacion}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ESTACION_NOMBRE")
    }
};

const getItemEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const { est_empresa } = req
        const data = await estacionModels.findAll({ where: { est_empresa: est_empresa}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ESTACION_EMPRESA")
    }
};


const getItem_empresa = async (req, res) => {
    try {
        req = matchedData(req);
        const { est_empresa } = req;

        const data = await estacionModels.findAll({
            where: {
                est_empresa: {
                    [Op.like]: `%${est_empresa}%`
                },
            }
        });

        console.log('Found companies: ', data);
        if (data.length > 0) {
            res.status(200).send({data});
        } else {
            res.status(404).send('no');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('ERROR_GET_EMPRESA');
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await estacionModels.create(body)
    res.send({data})
};
const updateEstacionData = async (req, res) => {
  try {
    req = matchedData(req);
    const { est_id, ...updateData } = req;
    
    const estacion = await estacionModels.findOne({
      where: { est_id: est_id }
    });
    
    if (!estacion) {
      return res.status(404).send({ error: "Estación no encontrada" });
    }
    
    await estacionModels.update(updateData, {
      where: { est_id: est_id } 
    });
    
    const updatedEstacion = await estacionModels.findOne({
      where: { est_id: est_id }
    });
    
    res.send({ 
      data: updatedEstacion,
      message: "Estación actualizada correctamente"
    });
  } catch (error) {
    console.error('Error en updateEstacionData:', error);
    res.status(500).send({ error: "ERROR_UPDATE_ESTACION_DATA", details: error.message });
  }
};

//Controllers Cortezza

const getItems_cortezza = async (req, res) => {
    try {
        // Consulta con filtro en la relación
        const data = await estacionModels.findAll({
            where: {
                est_empresa: nombre_cortezza
            }
        });

        // Validar si hay resultados
        if (data.length > 0) {
            res.send({ data });
        } else {
            res.status(404).send({ error: 'No hay estaciones para esta empresa' });
        }
    } catch (error) {
        console.error(error); // Log para depuración
        httpError(res, "ERROR_GET_ITEM_ESTACIONES");
    }
};

const getItem_cortezza = async (req, res) => {
    try {
        req = matchedData(req);
        const { est_empresa } = req;

        const data = await estacionModels.findAll({
           
            where: {
                est_empresa: {
                    [Op.like]: `%${est_empresa}%`
                },
                est_empresa: nombre_cortezza
            }
        });

        console.log('Found companies: ', data);
        if (data.length > 0) {
            console.log('Found companies: ', (data[0].bc_empresa.emp_id));
            res.status(200).send({data});  
        } else {
            res.status(404).send('no');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('ERROR_GET_EMPRESA');
    }
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, getItemNombre, getItemEmpresa, createItem, updateItem, deleteItem, getItem_empresa, getItem_cortezza, getItems_cortezza, updateEstacionData
}
