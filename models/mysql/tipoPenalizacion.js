const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const TipoPenalizacion = sequelize.define(
    "bc_tipo_penalizaciones",
    {
        tpp_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tpp_codigo_penalizacion: {
            type: DataTypes.STRING,
        },
        tpp_tiempo: {
            type: DataTypes.INTEGER,
        },
        tpp_dinero: {
            type: DataTypes.INTEGER,
        }
    }
);

module.exports = TipoPenalizacion;
