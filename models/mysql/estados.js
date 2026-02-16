const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Estados = sequelize.define(
    "bc_estados",
    {
        est_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        est_estado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Estados;