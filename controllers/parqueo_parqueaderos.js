const { matchedData } = require('express-validator');
const { parqueaderosModels, horariosParqeuaderoModels} = require('../models');

const { empresaModels, lugarParqueoModels  } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const { v4: uuidv4 } = require('uuid');


const getItems = async (req, res) => {
    try {
        const data = await parqueaderosModels.findAll({});
        res.send({data});
    } catch (error) {
        httpError(res, "ERROR_GET_PARQUEADEROS");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req)
        const {id} = req
        const data = await parqueaderosModels.findByPk(id);
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_ID_PARQUEADEROS")
    }
};

const getItemEmpresa = async (req, res) => {
    try {
        req = matchedData(req)
        const { empresa } = req
        const data = await parqueaderosModels.findAll({ where: { empresa: empresa}});
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PARQUEADEROS_EMPRESA")
    }
};

const createItem = async (req, res) => {
    const { body } = req
    const data = await parqueaderosModels.create(body)
    res.send({data})
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
        
        const data = await parqueaderosModels.findAll({ 
            where: { empresa: empresa.emp_nombre }
        });
        
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_PARQUEADEROS_EMPRESA_ID");
    }
};

const updateItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { id } = req;
        const body = req;
        delete body.id;
        
        const data = await parqueaderosModels.update(body, {
            where: { id: id }
        });
        
        if (data[0] === 0) {
            return httpError(res, "ESTACION_NOT_FOUND", 404);
        }
        
        res.send({
            message: "Estación actualizada correctamente",
            data: data
        });
    } catch (e) {
        console.error(e);
        httpError(res, "ERROR_UPDATE_ESTACION");
    }
};

const createPuntosCargaMasivo = async (req, res) => {
    try {
        const { body } = req;
        const { parqueaderoId, puntosCarga } = body;
        
        await lugarParqueoModels.destroy({
            where: { parqueadero: parqueaderoId }
        });
        
        const puntosConParqueadero = puntosCarga.map(punto => ({
            ...punto,
            parqueadero: parqueaderoId,
            id: punto.id || require('uuid').v4()
        }));
        
        const data = await lugarParqueoModels.bulkCreate(puntosConParqueadero);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_PUNTOS_CARGA_MASIVO");
    }
};

const updatePuntosCargaMasivo = async (req, res) => {
    try {
        const { parqueaderoId, puntosCarga } = req.body;
        
        if (!parqueaderoId || !puntosCarga) {
            return res.status(400).send({ error: "Faltan datos requeridos" });
        }
        
        const puntosExistentes = await lugarParqueoModels.findAll({
            where: { parqueadero: parqueaderoId }
        });
        
        const puntosConIdValido = puntosCarga.filter(p => p.id !== null && p.id !== undefined && p.id !== '');
        
        if (puntosConIdValido.length === 0 && puntosExistentes.length > 0) {
            
            const todosLosPuntos = await lugarParqueoModels.findAll({
                where: { parqueadero: parqueaderoId },
                order: [['numero', 'ASC']]
            });
            
            return res.send({ 
                message: "Sin cambios en puntos de carga",
                data: todosLosPuntos,
                warnings: []
            });
        }
        
        const puntosExistentesMap = new Map();
        puntosExistentes.forEach(punto => {
            puntosExistentesMap.set(punto.id, punto);
        });
        
        const messages = [];
        
        for (const punto of puntosCarga) {
            const puntoData = {
                numero: String(punto.numero),
                voltaje: String(punto.voltaje),
                estado: punto.estado,
                clave: punto.clave || "H",
                qr: punto.qr,
                bluetooth: punto.bluetooth,
                parqueadero: parqueaderoId
            };
            
            const tieneIdValido = punto.id !== null && punto.id !== undefined && punto.id !== '';
            
            if (tieneIdValido && puntosExistentesMap.has(punto.id)) {
                await lugarParqueoModels.update(puntoData, {
                    where: { 
                        id: punto.id,
                        parqueadero: parqueaderoId 
                    }
                });
            } else if (!tieneIdValido) {
                // Solo crear si realmente es un punto nuevo intencionado
                puntoData.id = require('uuid').v4();
                await lugarParqueoModels.create(puntoData);
            }
        }
        
        const idsEnviadosValidos = puntosCarga
            .filter(p => p.id !== null && p.id !== undefined && p.id !== '')
            .map(p => p.id);
            
        const puntosParaEliminar = puntosExistentes.filter(p => !idsEnviadosValidos.includes(p.id));
        
        for (const punto of puntosParaEliminar) {
            try {
                await lugarParqueoModels.destroy({
                    where: { id: punto.id }
                });
            } catch (error) {
                if (error.name === 'SequelizeForeignKeyConstraintError') {
                    messages.push(`No se puede eliminar el punto ${punto.numero} porque tiene rentas activas asociadas`);
                }
            }
        }
        
        const todosLosPuntos = await lugarParqueoModels.findAll({
            where: { parqueadero: parqueaderoId },
            order: [['numero', 'ASC']]
        });
        
        res.send({ 
            message: "Puntos de carga procesados",
            data: todosLosPuntos,
            warnings: messages
        });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_PUNTOS_CARGA_MASIVO");
    }
};
const getPuntosCargaByParqueadero = async (req, res) => {
    try {
        req = matchedData(req);
        const { parqueaderoId } = req;
        
        const data = await lugarParqueoModels.findAll({
            where: { parqueadero: parqueaderoId },
            order: [['numero', 'ASC']]
        });
        
        const formattedData = data.map(punto => ({
            id: punto.id,
            numero: punto.numero, 
            parqueadero: punto.parqueadero,
            voltaje: punto.voltaje,
            estado: punto.estado,
            clave: punto.clave,
            qr: punto.qr,
            bluetooth: punto.bluetooth
        }));
        
        
        res.send({ data: formattedData });
    } catch (error) {
        console.error('Error getting puntos carga:', error);
        httpError(res, "ERROR_GET_PUNTOS_CARGA_PARQUEADERO");
    }
};

const createHorariosMasivo = async (req, res) => {
    try {
        const { parqueaderoId, horarios } = req.body;
        
        await horariosParqeuaderoModels.destroy({
            where: { parqueadero: parqueaderoId }
        });
        
        const horariosLimpios = {};
        Object.keys(horarios).forEach(key => {
            horariosLimpios[key] = horarios[key] || "";
        });
        
        const horarioData = {
            id: uuidv4(),
            parqueadero: parqueaderoId,
            ...horariosLimpios
        };
        
        const data = await horariosParqeuaderoModels.create(horarioData);
        res.send({ data });
    } catch (error) {
        console.error('Error in createHorariosMasivo:', error);
        httpError(res, "ERROR_CREATE_HORARIOS_MASIVO");
    }
};
const updateHorariosMasivo = async (req, res) => {
    try {
        const { parqueaderoId, horarios } = req.body;
        
        const horarioExistente = await horariosParqeuaderoModels.findOne({
            where: { parqueadero: parqueaderoId }
        });
        
        if (horarioExistente) {
            await horariosParqeuaderoModels.update(horarios, {
                where: { parqueadero: parqueaderoId }
            });
        } else {
            const horarioData = {
                id: require('uuid').v4(),
                parqueadero: parqueaderoId,
                ...horarios
            };
            await horariosParqeuaderoModels.create(horarioData);
        }
        
        const data = await horariosParqeuaderoModels.findOne({
            where: { parqueadero: parqueaderoId }
        });
        
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_HORARIOS_MASIVO");
    }
};

const getHorariosByParqueadero = async (req, res) => {
    try {
        const { parqueaderoId } = req.params;
        
        const data = await horariosParqeuaderoModels.findAll({
            where: { parqueadero: parqueaderoId }
        });
        
        res.send({ data });
    } catch (error) {
        console.error('Error getting horarios:', error);
        httpError(res, "ERROR_GET_HORARIOS_PARQUEADERO");
    }
};
const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { id } = req;
        
        const puntosAsociados = await lugarParqueoModels.findAll({
            where: { parqueadero: id }
        });
        
        if (puntosAsociados.length > 0) {
            return res.status(400).send({
                success: false,
                message: "No se puede eliminar el ElectroHub porque tiene puntos de carga asociados"
            });
        }
        
        await horariosParqeuaderoModels.destroy({
            where: { parqueadero: id }
        });
        
        const deletedRows = await parqueaderosModels.destroy({
            where: { id: id }
        });
        
        if (deletedRows === 0) {
            return res.status(404).send({
                success: false,
                message: "ElectroHub no encontrado"
            });
        }
        
        res.send({
            success: true,
            message: "ElectroHub eliminado correctamente"
        });
    } catch (error) {
        console.error('Error eliminando ElectroHub:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).send({
                success: false,
                message: "No se puede eliminar el ElectroHub porque tiene registros asociados"
            });
        }
        httpError(res, "ERROR_DELETE_ELECTROHUB");
    }
};

module.exports = {
    getItems, getItem, getItemEmpresa, createItem, updateItem, deleteItem,getItemEmpresaId,
    createPuntosCargaMasivo, updatePuntosCargaMasivo, getPuntosCargaByParqueadero,
    getHorariosByParqueadero, createHorariosMasivo, updateHorariosMasivo
    
}
