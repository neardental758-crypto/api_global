const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

// 2. Modelo de Componentes
const Componente = sequelize.define(
    "bc_componentes",
    {
    comp_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comp_nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    comp_descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'bc_categorias_componentes',
        key: 'cat_id'
        }
    }
    },
    {
     timestamps: false
    }
);

module.exports = Componente;