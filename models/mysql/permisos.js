const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Permiso = sequelize.define(
    "bc_permisos",
    {
        per_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        per_componente_pantalla: {
            type: DataTypes.STRING,
        },
        per_funcionalidad: {
            type: DataTypes.STRING,
        },
        per_tipo: {
            type: DataTypes.STRING(50),
        },
        per_created_at: {
            type: DataTypes.DATE,
        },
        per_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);


module.exports = Permiso;
