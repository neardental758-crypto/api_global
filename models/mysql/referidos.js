const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Referidos = sequelize.define(
    "bc_usuarios_referidos",
    {
        usuario: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        codigo: {
            type: DataTypes.STRING,
        },
        fecha_creacion: {
            type: DataTypes.STRING,
        },
        referente: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Referidos;