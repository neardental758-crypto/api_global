const { matchedData } = require('express-validator');
const { candadosModels } = require('../models');
const { httpError } = require('../utils/handleError');
const { Op } = require('sequelize');

const getItems = async (req, res) => {
    try {
        const data = await candadosModels.findAll();
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEMS_CANDADO");
    }
};

const getItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_id } = req;
        const data = await candadosModels.findByPk(can_id);
        if (!data) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_CANDADO");
    }
};

const getItemByImei = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_imei } = req;
        const data = await candadosModels.findOne({
            where: { can_imei }
        });
        if (!data) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_CANDADO_BY_IMEI");
    }
};

const createItem = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await candadosModels.create(body);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_CREATE_CANDADO");
    }
};

const updateItem = async (req, res) => {
    try {
        const { can_id } = matchedData(req);
        const body = req.body;

        const candado = await candadosModels.findByPk(can_id);
        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }

        await candadosModels.update(body, {
            where: { can_id }
        });

        const data = await candadosModels.findByPk(can_id);
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_UPDATE_CANDADO");
    }
};

const deleteItem = async (req, res) => {
    try {
        req = matchedData(req);
        const { can_id } = req;

        const candado = await candadosModels.findByPk(can_id);
        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }

        await candadosModels.destroy({
            where: { can_id }
        });

        res.send({ message: "Candado eliminado exitosamente" });
    } catch (error) {
        httpError(res, "ERROR_DELETE_CANDADO");
    }
};

const verifyData5g = async (req, res) => {
    try {
        const { qrNumber, organizationId, userId } = req.body;

        if (!qrNumber) {
            return res.status(400).send({ error: "El numero de QR o MAC/IMEI es requerido" });
        }

        // Buscar el candado por MAC o IMEI o qr_numero
        const candado = await candadosModels.findOne({
            where: {
                [Op.or]: [
                    { can_mac: qrNumber },
                    { can_imei: qrNumber },
                    { can_qr_numero: qrNumber }
                ]
            }
        });

        if (!candado) {
            return res.status(404).send({ error: "Candado no encontrado" });
        }

        // Si tiene una bicicleta asignada, buscar la informacion de la bicicleta
        let bikeInformation = null;
        if (candado.can_bicicleta) {
            const { bicicletasModels } = require('../models');
            bikeInformation = await bicicletasModels.findByPk(candado.can_bicicleta);
        }

        const lockInformation = {
            id: candado.can_id,
            imei: candado.can_imei,
            mac: candado.can_mac,
            qrNumber: candado.can_qr_numero || qrNumber,
            organizationId: organizationId,
            lockStatus: candado.can_estado_candado
        };

        res.send({
            lockInformation,
            bikeInformation
        });

    } catch (error) {
        console.error("Error en verifyData5g:", error);
        httpError(res, "ERROR_VERIFY_DATA_5G");
    }
};

module.exports = {
    getItems,
    getItem,
    getItemByImei,
    createItem,
    updateItem,
    deleteItem,
    verifyData5g
};