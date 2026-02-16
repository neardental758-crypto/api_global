const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const TyCParqueo = sequelize.define(
    "parqueo_tyc",
    {
        usuario: {
            type: DataTypes.STRING,
            primaryKey: true,
        }, 
        fecha_inscripcion: {
            type: DataTypes.STRING,
        },
        ultimo_vehiculo: {
            type: DataTypes.STRING,
        },telefono: {
            type: DataTypes.STRING, 
        },
        email: {
            type: DataTypes.STRING,
        },
        saldo: {
            type: DataTypes.INTEGER,
        },
        estado: {
            type: DataTypes.STRING,
            defaultValue: "activo",
        },
    }
);

module.exports = TyCParqueo;