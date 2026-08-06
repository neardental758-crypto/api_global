const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const IntroduccionModuloUsuario = sequelize.define(
    "introduccion_modulo_usuario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_modulo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_usuario: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        estado_prueba: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'PENDIENTE'
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false,
        tableName: "introduccion_modulo_usuario"
    }
);

module.exports = IntroduccionModuloUsuario;
