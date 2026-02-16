const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const progresoDesafios = sequelize.define(
    "progreso_desafios",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
      
        usuario_id: {
            type: DataTypes.STRING,
        },
        desafio_id: {
            type: DataTypes.STRING,
        },
        progreso: {
            type: DataTypes.DOUBLE,
        },
        estado: {
            type: DataTypes.STRING,
        },
       fecha: {
          type: DataTypes.DATE,
    }
       

    });

    module.exports = progresoDesafios;
