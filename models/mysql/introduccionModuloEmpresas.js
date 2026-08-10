const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const IntroduccionModuloEmpresas = sequelize.define(
    "introduccion_modulo_empresas",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_modulo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        empresa: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'TODAS'
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false,
        tableName: "introduccion_modulo_empresas"
    }
);

module.exports = IntroduccionModuloEmpresas;
