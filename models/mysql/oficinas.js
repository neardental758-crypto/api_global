const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const oficinas = sequelize.define(
    "oficinas",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
        },
        direccion: {
            type: DataTypes.STRING,
        },
        ciudad: {
            type: DataTypes.STRING,
        },
        coor: {
            type: DataTypes.JSON,
        },
        idOrganizacion: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = oficinas;