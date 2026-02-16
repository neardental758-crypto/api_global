const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const FormularioOrganizacion = sequelize.define(
    "formOrganization",
    {
        idformOrganization: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
          type: DataTypes.STRING,
        },
        color1: {
            type: DataTypes.STRING,
        },
        color2: {
            type: DataTypes.STRING,
        },
        imagen: {
          type: DataTypes.STRING,
      },
    }
);

module.exports = FormularioOrganizacion;
