const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Registroext = sequelize.define(
    "bc_registro_ext",
    {
        idUser: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },	
        transporte_primario: {
            type: DataTypes.STRING,
        },	
        tiempo_casa_trabajo: {
            type: DataTypes.STRING,
        },	
        tiempo_trabajo_casa: {
            type: DataTypes.STRING,
        },	
        dias_trabajo: {
            type: DataTypes.STRING,
        },	
        satisfaccion_transporte: {
            type: DataTypes.INTEGER,
        },
        dinero_gastado_tranporte: {
            type: DataTypes.STRING,
        },	
        factor_principal_modo_transporte: {
            type: DataTypes.STRING,
        },	
        alternativas: {
            type: DataTypes.STRING,
        },	
        percepcion_movilizarce_bici: {
            type: DataTypes.STRING,
        },	
        barreras_movilizarce_bici: {
            type: DataTypes.STRING,
        },	
        beneficios_movilizarce_bici: {
            type: DataTypes.STRING,
        },	
        dias_semana_ejercicio: {
            type: DataTypes.INTEGER,
        },	
    }
);

module.exports = Registroext;