const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const respuestaBrain = sequelize.define(
    "respuestaBrain",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        id_pregunta: {
            type: DataTypes.STRING,
        },
        texto_respuesta: {
            type: DataTypes.STRING,
        },
        es_correcta: {
            type: DataTypes.BOOLEAN,
        },
    }
);

module.exports = respuestaBrain;
