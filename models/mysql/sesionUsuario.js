const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');



const SesionUsuario = sequelize.define(
    "sesiones_usuarios",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usu_documento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_ingreso: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        fecha_cierre: {
            type: DataTypes.DATE,
            allowNull: true
        },
        acciones: {
            type: DataTypes.JSON,
            allowNull: true
        },
    }
);

module.exports = SesionUsuario;