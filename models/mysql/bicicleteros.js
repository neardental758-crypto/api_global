const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Bicicletero = sequelize.define(
    "bc_bicicleteros",
    {
        bro_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bro_nombre: {
            type: DataTypes.STRING,
        },
        bro_estacion: {
            type: DataTypes.STRING,
        },
        bro_numero: {
            type: DataTypes.STRING,
        },
        bro_bicicleta: {
            type: DataTypes.INTEGER,
        },
        bro_bluetooth: {
            type: DataTypes.STRING,
        },
        bro_clave: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Bicicletero;