const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Logros = sequelize.define(
    "logros",
    {
        id_logro: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        descripcion: {
            type: DataTypes.TEXT,
        },
        fecha_creacion: {
          type: DataTypes.DATE,
        },
        imagen: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
        },
    });

    module.exports = Logros;
