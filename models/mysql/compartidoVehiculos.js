const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoVehiculo = sequelize.define(
    "compartidoVehiculo",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },	
        tipo: {
            type: DataTypes.STRING,
        },	
        marca: {
            type: DataTypes.STRING,
        },	
        modelo: {
            type: DataTypes.STRING,
        },	
        color: {
            type: DataTypes.STRING,
        },	
        placa: {
            type: DataTypes.STRING,
        },	
        idpropietario: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = compartidoVehiculo;
