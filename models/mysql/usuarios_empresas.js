const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const UsuarioEmpresas = sequelize.define(
    "bc_usuarios_empresas",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usu_documento: {
            type: DataTypes.STRING(45),
            allowNull: false,
            charset: 'latin1',
            references: {
                model: 'bc_usuarios',
                key: 'usu_documento'
            }
        },
        empresa_ids: {
            type: DataTypes.JSON,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
);

module.exports = UsuarioEmpresas;