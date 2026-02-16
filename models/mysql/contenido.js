const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const contenido = sequelize.define(
    "contenido",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        id_tematica: {
            type: DataTypes.STRING,
        },
        nombre_contenido: {
            type: DataTypes.STRING,
        },
        link_video: {
            type: DataTypes.STRING,
        },
        num_preguntas: {
            type: DataTypes.INTEGER,
        },
    }
);

module.exports = contenido;
