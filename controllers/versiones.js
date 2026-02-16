const { matchedData } = require('express-validator');
const { versionesModels } = require('../models');
const { httpError } = require('../utils/handleError');


const getItem = async (req, res) => {
    try {
        const { nombre_app } = req.params;
        console.log(nombre_app);
        //findOne para sequelize y find para mongoose
        const data = await versionesModels.findOne({
            where:  {
                nombre_app: nombre_app
            }
        });
        res.send({data});
    } catch (e) {
        httpError(res, "ERROR_GET_VERSIONES_APP")
    }
};

module.exports = {
    getItem
}