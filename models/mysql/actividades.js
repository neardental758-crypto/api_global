const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const actividades = sequelize.define(
    "actividades",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
        },
        fechaCreacion: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = actividades;
