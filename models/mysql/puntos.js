const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Puntos = sequelize.define(
    "bc_puntos",
    {
        pun_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        pun_usuario: {
            type: DataTypes.STRING,
        },
        pun_modulo: {
            type: DataTypes.STRING,
        },
        pun_fecha: {
            type: DataTypes.STRING,
        },
        pun_puntos: {
            type: DataTypes.INTEGER,
        },
        pun_motivo: {
            type: DataTypes.STRING,
        },		
    }
);

module.exports = Puntos;