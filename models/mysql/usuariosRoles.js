const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const UsuarioRol = sequelize.define(
    "bc_usuarios_roles",
    {
        ur_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        ur_usuario_id: {
            type: DataTypes.STRING,
        },
        ur_rol_id: {
            type: DataTypes.STRING,
        },
        ur_created_at: {
            type: DataTypes.DATE,
        },
        ur_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = UsuarioRol;
