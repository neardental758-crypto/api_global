const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const UsuarioPermiso = sequelize.define(
    "bc_usuarios_permisos",
    {
        up_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        up_usuario_id: {
            type: DataTypes.STRING,
        },
        up_permiso_id: {
            type: DataTypes.STRING,
        },
        up_created_at: {
            type: DataTypes.DATE,
        },
        up_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = UsuarioPermiso;
