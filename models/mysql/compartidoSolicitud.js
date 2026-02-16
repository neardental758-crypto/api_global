const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoSolicitud = sequelize.define(
    "compartidoSolicitud",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idSolicitante: {
            type: DataTypes.STRING,
        },
        fechaSolicitud: {
            type: DataTypes.STRING,
        },
        idViajeSolicitado: {
            type: DataTypes.STRING,
        },
        metodoSolicitado: {
            type: DataTypes.STRING,
        },
        estadoSolicitud: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = compartidoSolicitud;
