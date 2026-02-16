const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const RentaParqueo = sequelize.define(
    "parqueo_renta",
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
        vehiculo: {
            type: DataTypes.STRING,
        },  
        fecha: {
            type: DataTypes.STRING,
        },  
        inicio: {
            type: DataTypes.STRING,
        },  
        fin: {
            type: DataTypes.STRING,
        },  
        duracion: {
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

module.exports = RentaParqueo;