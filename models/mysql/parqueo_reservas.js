const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const ReservaParqueo = sequelize.define(
    "parqueo_reservas",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        usuario: {
            type: DataTypes.STRING,
        },
        parqueadero: {
            type: DataTypes.STRING,
        },  
        lugar_parqueo: {
            type: DataTypes.STRING,
        },
        fecha: {
            type: DataTypes.STRING,
        },  
        hora_inicio: {
            type: DataTypes.STRING,
        },  
        hora_fin: {
            type: DataTypes.STRING,
        },  
        dispositivo: {
            type: DataTypes.STRING,
        },  
        estado: {
            type: DataTypes.STRING,
        }, 
    }
);

module.exports = ReservaParqueo;