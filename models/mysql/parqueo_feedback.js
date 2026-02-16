const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const FeedbackParqueo = sequelize.define(
    "parqueo_feedback",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        }, 
        usuario: {
            type: DataTypes.STRING,
        }, 
        renta_parqueo: {
            type: DataTypes.STRING,
        }, 
        fecha: {
            type: DataTypes.STRING,
        }, 
        comentario: {
            type: DataTypes.STRING,
        }, 
        calificacion: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = FeedbackParqueo;