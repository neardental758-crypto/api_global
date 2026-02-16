const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const TokenMsn = sequelize.define(
    "tokenMsn",
    {
        _id:{ 
            type: DataTypes.STRING,
            primaryKey: true,
        },   
        documento: {
            type: DataTypes.STRING,
            unique: true,
        },    
        email: {
            type: DataTypes.STRING,
            unique: true,
        },    
        token: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = TokenMsn;