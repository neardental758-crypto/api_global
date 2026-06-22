const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const CambioBateria = sequelize.define(
    "bc_cambios_baterias",
    {
        cba_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cba_operario_id: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        cba_vehiculo_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cba_candado_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        cba_fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        cba_estado: {
            type: DataTypes.STRING(50),
            defaultValue: 'PENDIENTE'
        },
        cba_created_at: {
            type: DataTypes.DATE
        },
        cba_updated_at: {
            type: DataTypes.DATE
        }
    },
    {
        timestamps: false
    }
);

module.exports = CambioBateria;
