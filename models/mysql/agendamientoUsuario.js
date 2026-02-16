const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Agendados = sequelize.define(
    "bc_agendado",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        agendado_cedula: {
            type: DataTypes.STRING,
        },
        agendado_fecha: {
            type: DataTypes.STRING,
        },
        agendado_estacion: {
            type: DataTypes.STRING,
        },
        agendado_practica: {
            type: DataTypes.STRING,
        },
        agendado_estado: {
            type: DataTypes.STRING,
        },
        agendado_resultado: {
            type: DataTypes.STRING,
        },
    }
);


module.exports = Agendados;