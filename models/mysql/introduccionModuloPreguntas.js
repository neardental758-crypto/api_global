const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const IntroduccionModuloPreguntas = sequelize.define(
    "introduccion_modulo_preguntas",
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
        pregunta: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        opciones_respuestas: {
            type: DataTypes.JSON,
            allowNull: false
        },
        respuesta_verdadera: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false,
        tableName: "introduccion_modulo_preguntas"
    }
);

module.exports = IntroduccionModuloPreguntas;
