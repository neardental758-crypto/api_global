const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const compartidoConductor = sequelize.define(
    "compartidoConductor",
    {
        _id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
        },
        numero: {
            type: DataTypes.NUMBER,
        },
        daviplata: {
            type: DataTypes.BOOLEAN,
        },
        nequi : {
            type: DataTypes.BOOLEAN,
        },
        viajes: {
            type: DataTypes.INTEGER,
        },
        fechaInscripcion: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = compartidoConductor;
