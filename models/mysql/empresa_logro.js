const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Logros = sequelize.define(
    "empresa_logro",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        idEmpresa: {
            type: DataTypes.STRING,
        },
        idLogro: {
            type: DataTypes.STRING,
        },
        valor: {
            type: DataTypes.INTEGER,
        },
        meta: {
            type: DataTypes.INTEGER,
        },
        puntosGanar: {
            type: DataTypes.INTEGER,
        },
        inicio: {
            type: DataTypes.DATE,
        },
        fin: {
            type: DataTypes.DATE,
        },
        fechaCreacion: {
          type: DataTypes.DATE,
        },
        estado: {
            type: DataTypes.STRING,
        }
    });

    module.exports = Logros;
