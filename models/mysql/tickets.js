const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Tickets = sequelize.define(
    "bc_tickets_soporte",
    {
        tic_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tic_usuario: {
            type: DataTypes.STRING,
        },
        tic_comentario: {
            type: DataTypes.STRING,
        },
        tic_respuesta: {
            type: DataTypes.STRING,
        },
        tic_fecha_creacion: {
            type: DataTypes.STRING,
        },
        tic_fecha_respuesta: {
            type: DataTypes.STRING,
        },
        tic_estado: {
            type: DataTypes.STRING,
        },	
    }
);

module.exports = Tickets;