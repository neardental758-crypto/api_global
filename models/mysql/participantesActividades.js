const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const participantesActividades = sequelize.define(
    "participantes_actividades",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        participante: {
            type: DataTypes.STRING,
        },
        actividad: {
            type: DataTypes.STRING,
        },
        tiempo: {
            type: DataTypes.STRING,
        },
        velocidad: {
            type: DataTypes.STRING,
        },
        puesto: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = participantesActividades;