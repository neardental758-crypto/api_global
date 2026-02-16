const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Horarios_parqueadero = sequelize.define(
    "parqueo_horarios",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },	
       parqueadero: {
            type: DataTypes.STRING,
        },	
        hor_mon:{
            type: DataTypes.STRING,
        },	
        hor_tue:{
            type: DataTypes.STRING,
        },	
        hor_wed:{
            type: DataTypes.STRING,
        },	
        hor_thu:{
            type: DataTypes.STRING,
        },	
        hor_fri:{
            type: DataTypes.STRING,
        },	
        hor_sat:{
            type: DataTypes.STRING,
        },	
        hor_sun:{
            type: DataTypes.STRING,
        },
    }
);

module.exports = Horarios_parqueadero;