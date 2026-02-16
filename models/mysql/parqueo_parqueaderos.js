const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Parqueaderos = sequelize.define(
    "parqueo_parqueaderos",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        }, 
        nombre: {
            type: DataTypes.STRING,
        },  
        empresa: {
            type: DataTypes.STRING,
        },  
        capacidad: {
            type: DataTypes.STRING,
        },  
        latitud: {
            type: DataTypes.STRING,
        },  
        longitud: {
            type: DataTypes.STRING,
        },  
        direccion: {
            type: DataTypes.STRING,
        },  
        ciudad: {
            type: DataTypes.STRING,
        }, 
        distancia_mts: {
            type: DataTypes.INTEGER,
        },
        duracion_reserva_min: {
            type: DataTypes.INTEGER,
        },
        estado: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = Parqueaderos;
