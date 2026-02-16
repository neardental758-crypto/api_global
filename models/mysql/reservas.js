const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Reserva = sequelize.define(
    "bc_reservas",
    {
        res_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        res_estacion: {
            type: DataTypes.STRING,
        },
        res_usuario: {
            type: DataTypes.STRING,
        },
        res_bicicleta: {
            type: DataTypes.INTEGER,
        },
        res_fecha_inicio: {
            type: DataTypes.STRING,
        },
        res_hora_inicio: {
            type: DataTypes.STRING,
        },
        res_fecha_fin: {
            type: DataTypes.STRING,
        },
        res_hora_fin: {
            type: DataTypes.STRING,
        },
        res_estado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Reserva;
