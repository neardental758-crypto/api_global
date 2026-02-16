const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Teorica = sequelize.define(
    "bc_teorica",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        teorica_usuario: {
            type: DataTypes.STRING,
        },
        teorica_exitosas: {
            type: DataTypes.NUMBER,
        },
        teorica_fecha: {
            type: DataTypes.STRING,
        },
        teorica_resultado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Teorica;
