const { matchedData } = require('express-validator');
const { lugarParqueoModels } = require('../models');
const { httpError } = require('../utils/handleError');
const Parqueaderos = require('../models/mysql/parqueo_parqueaderos')
const { empresaModels, parqueaderosModels} = require('../models');
const { Op } = require('sequelize');


const getItems = async (req, res) => {
    try {
        //findAll para sequelize y find para mongoose
        const data = await lugarParqueoModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_LUGAR_PARQUEO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { id } = req;
        const data = await lugarParqueoModels.findByPk(id, {});
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_LUGAR_PARQUEO");
    }
};

const getItemParqueaderoDisponible = async (req, res) => {
    try {
        req = matchedData(req)
        const { parqueadero } = req
        const data = await lugarParqueoModels.findAll({ where: { parqueadero: parqueadero, estado: 'DISPONIBLE' } });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_PARQUEADERO")
    }
};

const getItemParqueaderoAll = async (req, res) => {
    try {
        req = matchedData(req)
        const { parqueadero } = req
        const data = await lugarParqueoModels.findAll({ where: { parqueadero: parqueadero } });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_PARQUEADERO")
    }
};

const getItemNumero = async (req, res) => {
    try {
        req = matchedData(req)
        const { numero } = req
        const data = await lugarParqueoModels.findAll({ where: { numero: numero, estado: 'DISPONIBLE' } });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_NUMERO")
    }
};

const getItemBluetooth = async (req, res) => {
    try {
        req = matchedData(req)
        const { bluetooth } = req
        const data = await lugarParqueoModels.findAll({ where: { bluetooth: bluetooth } });
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_BICI_BLUETOOTH")
    }
};

const getItemQR = async (req, res) => {
    try {
        req = matchedData(req);
        const { qr } = req;

        // Buscar el registro en la base de datos
        const data = await lugarParqueoModels.findOne({
            where: { qr: qr, estado: 'DISPONIBLE' },
            include: {
                model: Parqueaderos,
            },
        });

        // Verificar si se encontró el registro
        const response = data ? 1 : 0;

        res.send({
            data: data || null, // Enviar null si no hay coincidencias
            response, // Enviar 0 si no hay coincidencias, 1 si se encontró un registro
        });
    } catch (e) {
        console.error("Error al obtener el registro:", e);
        httpError(res, "ERROR_GET_BICI_NUMERO");
    }
};


const createItem = async (req, res) => {
    const { body } = req
    const data = await lugarParqueoModels.create(body)
    res.send({ data })
};

const updateItem = async (req, res) => {
    try {
        const { body } = req
        const data = await lugarParqueoModels.update(
            {
                estado: body.estado,
            },
            {
                where: { id: body.id },
            }
        )
        res.status(200);
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_LUGAR_PARQUEO");
    }
};

const updateItem_qr = async (req, res) => {
    try {
        const { body } = req
        const data = await lugarParqueoModels.update(
            {
                estado: body.estado,
            },
            {
                where: { qr: body.qr },
            }
        )
        res.status(200);
        res.send('ok');
    } catch (error) {
        httpError(res, "ERROR_UPDATE_ESTADO_LUGAR_PARQUEO_QR");
    }
};

const getItemEmpresaId = async (req, res) => {
   try {
       req = matchedData(req);
       const { empresaId } = req;
       
       const empresa = await empresaModels.findOne({
           where: { emp_id: empresaId }
       });
       
       
       if (!empresa) {
           return res.send({data: []});
       }
       
       const parqueaderos = await parqueaderosModels.findAll({
           where: { empresa: empresa.emp_nombre }
       });
       
       if (parqueaderos.length === 0) {
           return res.send({data: []});
       }
       
       const parqueaderosIds = parqueaderos.map(p => p.id);
       
       const data = await lugarParqueoModels.findAll({
           where: {
               parqueadero: {
                   [Op.in]: parqueaderosIds
               }
           },
           include: [{
               model: parqueaderosModels,
               as: 'parqueaderoInfo',
               attributes: ['nombre']
           }]
       });

       const mappedData = data.map(lugar => {
           const parqueadero = parqueaderos.find(p => p.id === lugar.parqueadero);
           return {
               ...lugar.toJSON(),
               parqueadero: parqueadero ? parqueadero.nombre : lugar.parqueadero,
               tipoParqueadero: parqueadero ? parqueadero.estado : null
           };
       });

       
       res.send({data: mappedData});
   } catch (e) {
       console.error(e);
       httpError(res, "ERROR_GET_LUGARES_EMPRESA_ID");
   }
};

const updateItemElectroHub = async (req, res) => {
    try {
        req = matchedData(req);
        const { id, numero, parqueadero, bluetooth, qr, clave, estado, voltaje } = req;
        
        const parqueaderoExists = await parqueaderosModels.findByPk(parqueadero);
        if (!parqueaderoExists) {
            return httpError(res, "PARQUEADERO_NOT_FOUND", 404);
        }
        
        const data = await lugarParqueoModels.update({
            numero: numero,
            parqueadero: parqueadero,
            bluetooth: bluetooth,
            qr: qr,
            clave: clave,
            estado: estado,
            voltaje: voltaje
        }, {
            where: { id: id }
        });
        
        if (data[0] === 0) {
            return httpError(res, "ELECTROHUB_NOT_FOUND", 404);
        }
        
        res.send({
            message: "Lugar actualizado correctamente",
            data: data
        });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_UPDATE_ELECTROHUB");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { id } = req;
        
        const deletedRows = await lugarParqueoModels.destroy({
            where: { id: id }
        });
        
        if (deletedRows === 0) {
            return res.status(404).send({
                success: false,
                message: "Punto de carga no encontrado"
            });
        }
        
        res.send({
            success: true,
            message: "Punto de carga eliminado correctamente"
        });
    } catch (error) {
        console.error('Error eliminando punto de carga:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).send({
                success: false,
                message: "No se puede eliminar el punto de carga porque tiene rentas activas asociadas"
            });
        }
        httpError(res, "ERROR_DELETE_PUNTO_CARGA");
    }
};
module.exports = {
    getItems, getItem, getItemNumero, getItemQR, getItemParqueaderoDisponible, getItemParqueaderoAll, createItem, updateItem, updateItem_qr, deleteItem, getItemEmpresaId, updateItemElectroHub, getItemBluetooth,
}
