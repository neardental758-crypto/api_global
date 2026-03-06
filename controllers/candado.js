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
        const { qrNumber, organizationId, userId, userCompany } = req.body;

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
            const { bicicletasModels, estacionModels, empresaModels } = require('../models');
            bikeInformation = await bicicletasModels.findByPk(candado.can_bicicleta);

            if (bikeInformation) {
                console.log(`\n\n=== [verifyData5g] INICIO VALIDACION ===`);
                console.log(`🚲 Bici ID: ${bikeInformation.bic_id} | Estado: ${bikeInformation.bic_estado}`);

                // 1. Validar si la bicicleta está 'DISPONIBLE'
                if (bikeInformation.bic_estado !== 'DISPONIBLE') {
                    console.warn(`❌ [Rechazo] Bici no DISPONIBLE (${bikeInformation.bic_estado})`);
                    return res.status(400).send({ error: "Esta bicicleta no se encuentra disponible para rentar en este momento." });
                }

                // 2. Validar que la organización del usuario coincida con la de la bicicleta
                if (userCompany) {
                    console.log(`👤 Usuario Empresa (desde frontend): ${userCompany}`);
                    const estacion = await estacionModels.findOne({
                        where: { est_estacion: bikeInformation.bic_estacion }
                    });

                    if (estacion) {
                        const empresaBici = await empresaModels.findOne({
                            where: { emp_nombre: estacion.est_empresa }
                        });
                        const empresaBiciNombre = empresaBici ? empresaBici.emp_nombre : estacion.est_empresa;
                        console.log(`🏢 Estacion: ${estacion.est_estacion} | Empresa de la Bici: ${empresaBiciNombre}`);

                        console.log(`⚖️ Comparando -> User: [${userCompany}] vs Bici: [${empresaBiciNombre}]`);

                        // Si la empresa de la bici NO se encontro, O si se encontro pero es diferente a la del usuario: Bloquear
                        if (!empresaBici || empresaBici.emp_nombre !== userCompany) {
                            console.warn(`❌ [Rechazo] Conflicto de empresas: ${empresaBiciNombre} != ${userCompany}`);
                            return res.status(400).send({ error: "Esta bicicleta pertenece a otra organización y no está autorizada para tu uso." });
                        } else {
                            console.log(`✅ [Exito] Empresas coinciden.`);
                        }
                    } else {
                        console.warn(`⚠️ [Advertencia] Estación no encontrada para la bici.`);
                    }
                } else {
                    console.warn(`⚠️ [Advertencia] 'userCompany' no fue provisto en la peticion.`);
                }
                console.log(`=== FIN VALIDACION ===\n\n`);
            }
        } else {
            return res.status(400).send({ error: "Este candado no tiene una bicicleta vinculada actualmente." });
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