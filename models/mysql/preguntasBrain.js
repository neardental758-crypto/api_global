const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const preguntasBrain = sequelize.define(
    "preguntasBrain",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        id_contenido: {
            type: DataTypes.STRING,
        },
        texto_pregunta: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = preguntasBrain;
