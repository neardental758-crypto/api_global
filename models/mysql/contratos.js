const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const contratos = sequelize.define(
    "contratos",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
        },
        notaContrato: {
            type: DataTypes.STRING,
        },
        idOrganizacion: {
            type: DataTypes.STRING,
        },
        fechaInicio: {
            type: DataTypes.STRING,
        },
        fechaFinal: {
            type: DataTypes.STRING,
        },
        vecesRenovado: {
            type: DataTypes.NUMBER,
        },
        fechaUpdate: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = contratos;