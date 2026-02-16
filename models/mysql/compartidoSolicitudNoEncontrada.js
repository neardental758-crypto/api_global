const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoSolicitudNoEncontrada = sequelize.define(
    "compartidoSolicitudesNoEncontradas",
    {
        id: {
            type: DataTypes.STRING(45),
            primaryKey: true,
            allowNull: false
        },
        idSolicitante: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        fechaSolicitud: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        posicion1: {
            type: DataTypes.JSON,
            allowNull: true
        },
        posicion2: {  // CORRECCIÓN: era posicion1 duplicado
            type: DataTypes.JSON,
            allowNull: true
        },
        estado: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fechaCreacion: {
            type: DataTypes.STRING(45),
            allowNull: true
        }
    },
    {
        tableName: 'compartidoSolicitudesNoEncontradas', // Nombre exacto de la tabla en MySQL
        timestamps: false, // CRÍTICO: Desactivar timestamps automáticos
        freezeTableName: true // Evita que Sequelize pluralice el nombre
    }
);

module.exports = compartidoSolicitudNoEncontrada;