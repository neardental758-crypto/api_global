const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const ReporteContradiccion = sequelize.define(
    "bc_reportes_contradicciones",
    {
        rep_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rep_estacion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rep_bicicleta_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        rep_bicicleta_numero: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rep_tecnico_documento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rep_comentario: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rep_estado: {
            type: DataTypes.STRING,
            defaultValue: 'PENDIENTE'
        },
        rep_fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }
);

module.exports = ReporteContradiccion;
