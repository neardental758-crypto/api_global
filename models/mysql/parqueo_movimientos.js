const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const ParqueoMovimientos = sequelize.define(
    "parqueo_movimientos",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        usuario: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parqueo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fecha_registro: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        valor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        concepto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }
);

module.exports = ParqueoMovimientos;
