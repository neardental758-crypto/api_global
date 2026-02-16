const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Fallas = sequelize.define(
    "bc_fallas",
    {
        fal_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fal_estado: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Fallas;