const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const NotificacionesProgramadas = sequelize.define(
    "bc_notificaciones_programadas",
    {
        prog_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        prog_organizacion_id: {
            type: DataTypes.STRING,
        },
        prog_remitente: {
            type: DataTypes.STRING,
        },
        prog_titulo: {
            type: DataTypes.STRING,
        },
        prog_mensaje: {
            type: DataTypes.TEXT,
        },
        prog_tipo_mensaje: {
            type: DataTypes.STRING,
        },
        prog_destinatarios: {
            type: DataTypes.TEXT('long'),
        },
        prog_send_to_type: {
            type: DataTypes.STRING,
        },
        prog_selected_estacion: {
            type: DataTypes.STRING,
        },
        prog_filter_type: {
            type: DataTypes.STRING,
        },
        prog_image_url: {
            type: DataTypes.STRING(2048),
        },
        prog_es_recurrente: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        prog_fecha: {
            type: DataTypes.STRING,
        },
        prog_hora: {
            type: DataTypes.STRING,
        },
        prog_dia_semana: {
            type: DataTypes.STRING,
        },
        prog_estado: {
            type: DataTypes.STRING,
            defaultValue: 'PENDIENTE'
        },
        prog_fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        prog_ultima_ejecucion: {
            type: DataTypes.DATE,
        }
    }
);

module.exports = NotificacionesProgramadas;
