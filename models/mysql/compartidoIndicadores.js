const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoIndicadores = sequelize.define(
    "compartidoIndicadores",
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
        distancia: {
            type: DataTypes.STRING,
        },
        codos: {
            type: DataTypes.FLOAT,
        },
        calorias: {
            type: DataTypes.FLOAT,
        },
        dinero: {
            type: DataTypes.INTEGER,
        },
        tiempo: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = compartidoIndicadores;
