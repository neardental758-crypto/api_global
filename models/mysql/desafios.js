const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Desafios = sequelize.define(
    "desafios",
    {
        id_desafio: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
      
        descripcion: {
            type: DataTypes.TEXT,
        },
        valor: {
            type: DataTypes.INTEGER,
        },
     
       fecha_creacion: {
          type: DataTypes.DATE,
    },
        estado: {
        type: DataTypes.STRING,
    },
       criterios: {
        type: DataTypes.JSON,
    },
     fecha_inicio: {
        type: DataTypes.DATE,
  },
    fecha_fin: {
    type: DataTypes.DATE,
},

    });

    module.exports = Desafios;
