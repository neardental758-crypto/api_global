const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const RegistroPP = sequelize.define(
    "bc_registros_pp",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },	
        usuario: {
            type: DataTypes.STRING,
        },	
        idViaje: {
            type: DataTypes.STRING,
        },	
        fecha: {
            type: DataTypes.STRING,
        },	
        vehiculo: {
            type: DataTypes.STRING,
        },	
        distancia: {
            type: DataTypes.INTEGER,
        },
        respuestas: {
            type: DataTypes.JSON
        },
        comentario: {
            type: DataTypes.STRING,
        }
    }
);

module.exports = RegistroPP;