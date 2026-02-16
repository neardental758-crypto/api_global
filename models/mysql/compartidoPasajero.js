const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const pasajero = sequelize.define(
    "compartidoPasajero",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        fechaInscripcion: {
            type: DataTypes.STRING,
        },
        viajes: {
            type: DataTypes.INTEGER,
        },
    }
);

module.exports = pasajero;
