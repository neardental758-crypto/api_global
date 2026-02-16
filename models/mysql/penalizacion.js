const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Penalizacion = sequelize.define(
    "bc_penalizaciones",
    {
        pen_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },	
        pen_tipo_penalizacion:{
            type: DataTypes.INTEGER,
        },	
        pen_novedad:{
            type: DataTypes.STRING,
        },	
        pen_usuario:{
            type: DataTypes.STRING,
        },	
        pen_fecha_creacion:{
            type: DataTypes.STRING,
        },	
        pen_fecha_tiempo_ok:{
            type: DataTypes.STRING,
        },	
        pen_fecha_dinero_ok:{
            type: DataTypes.STRING,
        },	
        pen_estado:{
            type: DataTypes.STRING,
        },	
        pen_fecha_apelado:{
            type: DataTypes.STRING,
        },	
        pen_motivo_apelado:{
            type: DataTypes.STRING,
        },
    }
);

module.exports = Penalizacion;