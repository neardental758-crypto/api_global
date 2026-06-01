const { tipoPenalizacionModels } = require('../models');
const { httpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await tipoPenalizacionModels.findAll({});
        res.send({ data });
    } catch (error) {
        httpError(res, "ERROR_GET_ITEM_TIPO_PENALIZACION");
    }
};

const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tipoPenalizacionModels.findByPk(id);
        res.send({ data });
    } catch (e) {
        httpError(res, "ERROR_GET_TIPO_PENALIZACION");
    }
};

module.exports = {
    getItems,
    getItem
};
