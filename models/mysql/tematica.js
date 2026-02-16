const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const tematica = sequelize.define(
    "tematica",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre_tematica: {
            type: DataTypes.STRING,
        },
        logo_tematica: {
            type: DataTypes.STRING,
        },
        tematica_activa: {
            type: DataTypes.BOOLEAN,
        }
    }
);

module.exports = tematica;
