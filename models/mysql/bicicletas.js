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
        bic_latitud: {
            type: DataTypes.DECIMAL(10, 8),
        },
        bic_longitud: {
            type: DataTypes.DECIMAL(11, 8),
        },
        can_id: {
            type: DataTypes.STRING,
        },
        bic_created_at: {
            type: DataTypes.DATE,
        },
        bic_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Bicicleta;