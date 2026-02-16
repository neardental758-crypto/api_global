const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const viajeActivo = sequelize.define(
    "compartidoViajeActivo",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idOrganizacion: {
            type: DataTypes.STRING,
        },
        lSalida: {
            type: DataTypes.STRING,
        },
        llegada: {
            type: DataTypes.STRING,
        },
        fecha: {
            type: DataTypes.STRING,
        },
        vehiculo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        conductor: {
            type: DataTypes.STRING,
        },
        asientosIda  : {
            type: DataTypes.INTEGER,
        },
        asientosVuelta  : {
            type: DataTypes.INTEGER,
        },
        estado: {
            type: DataTypes.STRING,
        },
        polilyne: {
            type: DataTypes.STRING,
        },
        coorSalida: {
            type: DataTypes.JSON,
        },
        coorDestino: {
            type: DataTypes.JSON,
        },
        precio: {
            type: DataTypes.INTEGER,
        },
        distancia: {
            type: DataTypes.FLOAT,
        },
        distanciaGoogle: {
            type: DataTypes.STRING,
        },
        fechaCreacion: {
            type: DataTypes.STRING,
        },
        duracionGoogle: {
            type: DataTypes.STRING,
        },
        pagoAceptado: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = viajeActivo;
