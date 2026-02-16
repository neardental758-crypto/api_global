const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Preoperacionales = sequelize.define(
    "bc_preoperacionales",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        usuario: {
            type: DataTypes.STRING,
        },
        idViaje: {
            type: DataTypes.STRING,
        },
        modulo: {
            type: DataTypes.STRING,
        },
        respuestas: {
            type: DataTypes.JSON
        },
        comentario: {
            type: DataTypes.STRING,
        }
    });

    module.exports = Preoperacionales;
