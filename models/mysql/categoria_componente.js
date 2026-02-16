const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

// 1. Modelo de Categorías de Componentes
const CategoriaComponente = sequelize.define(
    "bc_categorias_componentes",
    {
    cat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cat_nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cat_descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
        }
    },
    {
      timestamps: false
    }
);

module.exports = CategoriaComponente;