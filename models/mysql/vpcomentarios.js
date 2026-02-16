const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Vpcomentarios = sequelize.define(
    "vp_comentarios",
    {
        com_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: false
        },
        com_usuario: {
            type: DataTypes.STRING,
        },
        com_comentario: {
            type: DataTypes.STRING,
        },
        com_calificacion: {
            type: DataTypes.STRING,
        },
        com_fecha: {
            type: DataTypes.STRING,
        },
        com_id_viaje: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }
);

module.exports = Vpcomentarios;