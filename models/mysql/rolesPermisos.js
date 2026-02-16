const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const RolPermiso = sequelize.define(
    "bc_roles_permisos",
    {
        rp_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        rp_rol_id: {
            type: DataTypes.STRING,
        },
        rp_permiso_id: {
            type: DataTypes.STRING,
        },
        rp_created_at: {
            type: DataTypes.DATE,
        },
        rp_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);


module.exports = RolPermiso;
