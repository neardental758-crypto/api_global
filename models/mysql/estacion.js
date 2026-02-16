const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Estacion = sequelize.define(
    "bc_estaciones",
    {
        est_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        est_estacion: {
            type: DataTypes.STRING,
        },
        est_empresa: {
            type: DataTypes.STRING,
        },
        est_num_bicicleteros: {
            type: DataTypes.INTEGER,
        },
        est_habilitada: {
            type: DataTypes.INTEGER,
        },
        est_mac: {
            type: DataTypes.STRING,
        },
        est_electrica: {
            type: DataTypes.INTEGER,
        },
        est_horario: {
            type: DataTypes.STRING,
        },
        est_last_conect: {
            type: DataTypes.STRING,
        },
        est_puestos_intercambiables: {
            type: DataTypes.INTEGER,
        },
        est_latitud: {
            type: DataTypes.FLOAT,
        },
        est_longitud: {
            type: DataTypes.FLOAT,
        },
        est_ciudad: {
            type: DataTypes.STRING,
        },
        est_automatizada: {
            type: DataTypes.INTEGER,
        },
        est_direccion: {
            type: DataTypes.STRING
        },
        est_descripcion: {
            type: DataTypes.STRING
        },
        est_alertas: {
            type: DataTypes.STRING,
        },
        est_rebalanceo: {
            type: DataTypes.STRING,
        },
        est_created_at: {
            type: DataTypes.DATE,
        },
        est_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Estacion;
