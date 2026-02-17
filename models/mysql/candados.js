const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Candado = sequelize.define(
    "bc_candados",
    {
        can_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        can_imei: {
            type: DataTypes.STRING(50),
        },
        can_qr_numero: {
            type: DataTypes.STRING(50),
        },
        can_latitud: {
            type: DataTypes.DECIMAL(10, 8),
        },
        can_longitud: {
            type: DataTypes.DECIMAL(11, 8),
        },
        can_mac: {
            type: DataTypes.STRING(50),
        },
        can_bateria: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        can_estado_candado: {
            type: DataTypes.STRING(50),
            defaultValue: 'closed'
        },
        can_senal: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        can_numero_sim: {
            type: DataTypes.STRING(50),
        },
        can_fecha_ultimo_comando: {
            type: DataTypes.DATE,
        },
        can_ultimo_comando: {
            type: DataTypes.STRING,
        },
        can_bicicleta: {
            type: DataTypes.INTEGER,
        },
        can_created_at: {
            type: DataTypes.DATE,
        },
        can_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Candado;
