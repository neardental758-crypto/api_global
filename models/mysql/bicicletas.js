const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Bicicleta = sequelize.define(
    "bc_bicicletas",
    {
        bic_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bic_nombre: {
            type: DataTypes.STRING,
        },
        bic_numero: {
            type: DataTypes.STRING,
        },
        bic_estacion: {
            type: DataTypes.STRING,
        },
        bic_estado: {
            type: DataTypes.STRING,
        },
        bic_descripcion: {
            type: DataTypes.STRING,
        },
        bic_created_at: {
            type: DataTypes.DATE,
        },
        bic_updated_at: {
            type: DataTypes.DATE,
        },
        bic_bluetooth: {
            type: DataTypes.STRING,
        },
        bic_clave: {
            type: DataTypes.STRING,
        },
        bic_numero_serie: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bic_modelo_vehiculo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bic_numero_bateria: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bic_numero_cargador: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bic_fecha_ingreso_operacion: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        timestamps: false
    }
);

module.exports = Bicicleta;