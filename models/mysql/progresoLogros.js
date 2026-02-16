const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const progresoLogros = sequelize.define(
    "progreso_logros",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
      
        usuario_id: {
            type: DataTypes.STRING,
        },
        logro_id: {
            type: DataTypes.STRING,
        },
        progreso: {
            type: DataTypes.DOUBLE,
        },
        estado: {
            type: DataTypes.STRING,
        },
       ultima_actualizacion: {
          type: DataTypes.DATE,
    }
       

    });

    module.exports = progresoLogros;
