const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const VersionesApp = sequelize.define(
    "bc_versiones_app",
    {
        id:{
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nombre_app:{
            type: DataTypes.STRING,
        },
        ultima_version_android: {
            type: DataTypes.STRING,
        },
        ultima_version_ios:{
            type: DataTypes.STRING,
        }
    }
);

module.exports = VersionesApp;
