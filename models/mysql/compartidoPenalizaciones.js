const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoPenalizacion = sequelize.define(
    "compartidoPenalizacion",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        idUsuario :{
            type: DataTypes.STRING
        },
        idViaje :{
            type: DataTypes.STRING
        },
        penalizadoHasta: {
            type: DataTypes.STRING,
        },
        penalizadoDesde: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = compartidoPenalizacion;
