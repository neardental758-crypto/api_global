const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Usuario = sequelize.define(
    "bc_usuarios",
    {
        usu_documento: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        usu_tipo_documento: {
            type: DataTypes.STRING(50),
        },
        usu_nombre: {
            type: DataTypes.STRING,
        },
        usu_email: {
            type: DataTypes.STRING,
        },
        usu_password: {
            type: DataTypes.STRING,
        },
        usu_telefono: {
            type: DataTypes.STRING(50),
        },
        usu_empresa: {
            type: DataTypes.STRING,
        },
        usu_ciudad: {
            type: DataTypes.STRING,
        },
        usu_fecha_nacimiento: {
            type: DataTypes.STRING,
        },
        usu_genero: {
            type: DataTypes.STRING,
        },
        usu_dir_trabajo: {
            type: DataTypes.STRING,
        },
        usu_dir_casa: {
            type: DataTypes.STRING,
        },
        usu_recorrido: {
            type: DataTypes.STRING,
        },
        usu_coor_casa: {
            type: DataTypes.JSON,
        },
        usu_coor_trabajo: {
            type: DataTypes.JSON,
        },
        usu_img: {
            type: DataTypes.STRING,
        },
        usu_habilitado: {
            type: DataTypes.INTEGER,
        },
        usu_prueba: {
            type: DataTypes.BOOLEAN,
        },
        usu_rol_dash: {
            type: DataTypes.STRING,
        },
        usu_created_at: {
            type: DataTypes.DATE,
        },
        usu_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Usuario;
