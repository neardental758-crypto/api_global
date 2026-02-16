const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Vpviajes = sequelize.define(
    "vp_viajes",
    {
        via_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: false
        },
        via_usuario: {
            type: DataTypes.STRING,
        },
        via_vehiculo: {
            type: DataTypes.STRING,
        },
        via_partida: {
            type: DataTypes.STRING,
        },
        via_llegada: {
            type: DataTypes.STRING,
        },
        via_fecha_creacion: {
            type: DataTypes.STRING,
        }, 
        via_duracion: {
            type: DataTypes.STRING,
        },
        via_kilometros: {
            type: DataTypes.STRING,
        },
        via_calorias: {
            type: DataTypes.STRING,
        },           
        via_co2: {
            type: DataTypes.STRING,
        },          
        via_img: {
            type: DataTypes.STRING,
        },
        via_estado: {
            type: DataTypes.STRING,
        }, 
    }
);

module.exports = Vpviajes;