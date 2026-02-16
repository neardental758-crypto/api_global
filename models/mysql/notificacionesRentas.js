const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const NotificacionRenta = sequelize.define(
    "bc_notificaciones_rentas",
    {
        not_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        not_renta_id: {
            type: DataTypes.INTEGER,
        },
        not_usuario: {
            type: DataTypes.STRING,
        },
        not_fecha_vencimiento: {
            type: DataTypes.DATE,
        },
        not_hora_vencimiento: {
            type: DataTypes.STRING,
        },
        not_estado: {
            type: DataTypes.STRING,
            defaultValue: 'PENDIENTE'
        },
        not_fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }
);

module.exports = NotificacionRenta;