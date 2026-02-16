
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const UsuarioCredencial = sequelize.define(
    "bc_usuarios_credenciales",
    {
        uc_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        uc_usuario_id: {
            type: DataTypes.STRING,
        },
        uc_password: {
            type: DataTypes.STRING,
        },
        uc_created_at: {
            type: DataTypes.DATE,
        },
        uc_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = UsuarioCredencial;
