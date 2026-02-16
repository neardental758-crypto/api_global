const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Historiales = sequelize.define(
    "bc_historial_claves",
    {
        his_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        his_usuario: {
            type: DataTypes.STRING,
        },
        his_estacion: {
            type: DataTypes.STRING,
        },
        his_bicicletero: {
            type: DataTypes.INTEGER,
        },
        his_bicicleta: {
            type: DataTypes.INTEGER,
        },
        his_fecha: {
            type: DataTypes.STRING,
        },
        his_clave_old: {
            type: DataTypes.STRING,
        },
        his_clave_new: {
            type: DataTypes.STRING,
        },
        his_estado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Historiales;