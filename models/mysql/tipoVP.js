const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const TipoVP = sequelize.define(
    "vp_tipo_vehiculos",
    {
        tip_id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    	tip_nombre: {
            type: DataTypes.STRING,
        },
        tip_estado:{
            type: DataTypes.INTEGER,
        },   
        tip_mostrar:{
            type: DataTypes.BOOLEAN,
        },   
    }
);

module.exports = TipoVP;