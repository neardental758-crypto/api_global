const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoPagos = sequelize.define(
    "compartidoPagos",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idViaje: {
            type: DataTypes.STRING,
        },
        idConductor: {
            type: DataTypes.STRING,
        },
        idPasajero: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idSolicitud: {
            type: DataTypes.STRING,
            allowNull: false
        },
        valor: {
            type: DataTypes.STRING,
        },
        metodo: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = compartidoPagos;