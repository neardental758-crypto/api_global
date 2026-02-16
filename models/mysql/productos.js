const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Productos = sequelize.define(
    "productos",
    {
        id_producto: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        empresa: {
            type: DataTypes.STRING,
        },
        nombre: {
            type: DataTypes.STRING,
        },
        descripcion: {
            type: DataTypes.TEXT,
        },
        cantidad: {
            type: DataTypes.INTEGER,
        },
        valor: {
            type: DataTypes.INTEGER,
        },
        nivel: {
            type: DataTypes.INTEGER,
        },
        imagen: {
          type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
        }

    });

    module.exports = Productos;
