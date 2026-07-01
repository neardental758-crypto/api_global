const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const HistorialNotificaciones = sequelize.define(
    "bc_historial_notificaciones",
    {
        hnot_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        hnot_remitente: {
            type: DataTypes.STRING,
        },
        hnot_organizacion_id: {
            type: DataTypes.STRING,
        },
        hnot_titulo: {
            type: DataTypes.STRING,
        },
        hnot_mensaje: {
            type: DataTypes.TEXT,
        },
        hnot_tipo_mensaje: {
            type: DataTypes.STRING,
        },
        hnot_destinatarios: {
            type: DataTypes.TEXT('long'),
        },
        hnot_destinatarios_conteo: {
            type: DataTypes.INTEGER,
        },
        hnot_exitosas: {
            type: DataTypes.INTEGER,
        },
        hnot_fallidas: {
            type: DataTypes.INTEGER,
        },
        hnot_fecha_envio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }
);

module.exports = HistorialNotificaciones;
