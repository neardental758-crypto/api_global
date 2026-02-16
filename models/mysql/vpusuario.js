const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Vpusuarios = sequelize.define(
    "vp_vehiculos_usuario",
    {
        vus_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: false
        },
        vus_usuario: {
            type: DataTypes.STRING,
        },
        vus_tipo: {
            type: DataTypes.STRING,
        },
        vus_marca: {
            type: DataTypes.STRING,
        },
        vus_modelo: {
            type: DataTypes.STRING,
        },
        vus_cilindraje: {
            type: DataTypes.STRING,
        },
        vus_color: {
            type: DataTypes.STRING,
        },
        vus_serial: {
            type: DataTypes.STRING,
        },
        vus_fecha_registro: {
            type: DataTypes.STRING,
        },
        vus_img: {
            type: DataTypes.STRING,
        },
        vus_estado: {
            type: DataTypes.STRING,
        },	 
    }
);

module.exports = Vpusuarios;