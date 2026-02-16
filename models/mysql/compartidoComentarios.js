const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoComentarios = sequelize.define(
    "compartidoComentarios",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idEnvio: {
            type: DataTypes.STRING,
        },
        idRecibido: {
            type: DataTypes.STRING,
        },
        relacion: {
            type: DataTypes.STRING,
        },
        calificacion: {
            type: DataTypes.STRING,
        },
        comentario: {
            type: DataTypes.STRING,
        },
        idViaje: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = compartidoComentarios;