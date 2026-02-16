const { matchedData } = require("express-validator");
const SesionUsuario = require("../models/mysql/sesionUsuario");
const { httpError } = require("../utils/handleError");
const { sequelize } = require('../config/mysql');


const createSession = async (req, res) => {
    try {
        req = matchedData(req);
        
        const now = new Date();
        const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        
        const existingSession = await SesionUsuario.findOne({
            where: {
                usu_documento: req.usu_documento,
                fecha_cierre: null
            }
        });
        
        if (existingSession) {
            res.send({ data: existingSession });
            return;
        }
        
        const session = await SesionUsuario.create({
            usu_documento: req.usu_documento,
            fecha_ingreso: localTime
        });
        
        res.send({ data: session });
    } catch (e) {
        httpError(res, "ERROR_CREATE_SESSION");
    }
};

const closeSession = async (req, res) => {
    try {
        req = matchedData(req);
        
        const now = new Date();
        const localTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        
        const session = await SesionUsuario.findOne({
            where: {
                usu_documento: req.usu_documento,
                fecha_cierre: null
            },
            order: [['fecha_ingreso', 'DESC']]
        });
        
        if (session) {
            await session.update({
                fecha_cierre: localTime
            });
        }
        
        res.send({ data: session });
    } catch (e) {
        httpError(res, "ERROR_CLOSE_SESSION");
    }
};


module.exports = { createSession, closeSession };