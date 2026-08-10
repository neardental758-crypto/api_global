const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const IntroduccionModulos = sequelize.define(
    "introduccion_modulos",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        empresa: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'TODAS'
        },
        url_video: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        orden: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_preguntas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        min_preguntas_aprobar: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4
        },
        estado: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'ACTIVA'
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false,
        tableName: "introduccion_modulos"
    }
);

module.exports = IntroduccionModulos;
