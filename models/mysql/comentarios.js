const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Comentarios = sequelize.define(
    "bc_comentarios_rentas",
    {
        com_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        com_usuario: {
            type: DataTypes.STRING,
        },
        com_prestamo: {
            type: DataTypes.INTEGER,
        },
        com_fecha: {
            type: DataTypes.DATE,
        },
        com_comentario: {
            type: DataTypes.STRING,
        },
        com_estado: {
            type: DataTypes.STRING,
        },
        com_calificacion: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Comentarios;
