const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const VehiculoFalla = sequelize.define(
    "bc_vehiculos_fallas",
    {
        vef_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vef_usuario: {
            type: DataTypes.STRING,
        },
        vef_vehiculo: {
            type: DataTypes.INTEGER,
        },
        vef_fecha: {
            type: DataTypes.STRING,
        },
        vef_falla: {
            type: DataTypes.STRING,
        },
        vef_estado: {
            type: DataTypes.STRING,
        },	
    }
);

module.exports = VehiculoFalla;