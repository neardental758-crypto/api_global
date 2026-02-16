const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Rol = sequelize.define(
    "bc_roles",
    {
        rol_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        rol_nombre: {
            type: DataTypes.STRING(100),
        },
        rol_descripcion: {
            type: DataTypes.STRING,
        },
        rol_created_at: {
            type: DataTypes.DATE,
        },
        rol_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Rol;