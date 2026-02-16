const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Indicadores = sequelize.define(
    "bc_indicadores_trip",
    {
        ind_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ind_usuario: {
            type: DataTypes.STRING,
        },
        ind_viaje: {
            type: DataTypes.STRING,
        },
        ind_modulo: {
            type: DataTypes.STRING,
        },
        ind_duracion: {
            type: DataTypes.STRING,
        },
        ind_distancia: {
            type: DataTypes.STRING,
        },
        ind_calorias: {
            type: DataTypes.STRING,
        },
        ind_co2: {
            type: DataTypes.STRING,
        }
    });

    module.exports = Indicadores;
