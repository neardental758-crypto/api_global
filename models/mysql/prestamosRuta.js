const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const PrestamosRuta = sequelize.define(
    "bc_prestamos_ruta",
    {
        pr_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pr_prestamo_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pr_ruta: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        }
    },
    {
        tableName: 'bc_prestamos_ruta',
        timestamps: true,
        createdAt: 'pr_created_at',
        updatedAt: 'pr_updated_at'
    }
);

module.exports = PrestamosRuta;
