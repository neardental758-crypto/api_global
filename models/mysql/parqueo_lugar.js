const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const LugarParqueo = sequelize.define(
    "parqueo_lugar",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        }, 
        numero: {
            type: DataTypes.STRING,
        },  
        parqueadero: {
            type: DataTypes.STRING,
        },  
        bluetooth: {
            type: DataTypes.STRING,
        },  
        qr: {
            type: DataTypes.STRING,
        },  
        clave: {
            type: DataTypes.STRING,
        },  
        voltaje: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
        }, 
    }
);

module.exports = LugarParqueo;