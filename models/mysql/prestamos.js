const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Prestamos = sequelize.define(
    "bc_prestamos",
    {
        pre_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pre_hora_server: {
            type: DataTypes.STRING,
        },
        pre_usuario: {
            type: DataTypes.STRING,
        },
        pre_bicicleta: {
            type: DataTypes.INTEGER,
        },
        pre_retiro_estacion: {
            type: DataTypes.STRING,
        },
        pre_retiro_bicicletero: {
            type: DataTypes.INTEGER,
        },
        pre_retiro_fecha: {
            type: DataTypes.DATE,
        },
        pre_retiro_hora: {
            type: DataTypes.STRING,
        },
        pre_devolucion_estacion: {
            type: DataTypes.STRING,
        },
        pre_devolucion_bicicletero: {
            type: DataTypes.INTEGER,
        },
        pre_devolucion_fecha: {
            type: DataTypes.DATE,
        },
        pre_devolucion_hora: {
            type: DataTypes.STRING,
        },
        pre_duracion: {
            type: DataTypes.STRING,
        },
        pre_dispositivo: {
            type: DataTypes.STRING,
        },
        pre_estado: {
            type: DataTypes.STRING,
        }
    });

    module.exports = Prestamos;
