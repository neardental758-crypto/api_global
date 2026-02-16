const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const PracticaActiva = sequelize.define(
    "bc_practica",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        practica_funcionario: {
            type: DataTypes.STRING,
        },
        practica_cupos: {
            type: DataTypes.INTEGER,
        },
        practica_estacion: {
            type: DataTypes.STRING,
        },
        practica_fecha: {
            type: DataTypes.STRING,
        },
        practica_hora_finalizar: {
            type: DataTypes.STRING,
        },
        practica_estado: {
            type: DataTypes.STRING,
        },
        reagendada: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }
);

module.exports = PracticaActiva;
