const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

// 5. Modelo de Historial de Mantenimientos
const HistorialMantenimiento = sequelize.define(
    "bc_historial_mantenimientos",
    {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    mantenimiento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
    model: 'bc_mantenimientos',
    key: 'id'
    }
    },
    componente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
    model: 'bc_componentes',
    key: 'comp_id'
    }
    },
    estado_anterior: {
    type: DataTypes.ENUM('ok', 'cambio', 'ajuste', 'arreglo', 'revisión'),
    allowNull: true
    },
    estado_nuevo: {
    type: DataTypes.ENUM('ok', 'cambio', 'ajuste', 'arreglo', 'revisión'),
    allowNull: false
    },
    accion_realizada: {
    type: DataTypes.ENUM('diagnóstico', 'reparación', 'reemplazo', 'ajuste', 'ninguna'),
    allowNull: false
    },
    comentario: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
    },
    operario_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
    model: 'bc_usuarios',
    key: 'usu_documento'
    }
    }
    }
    );

    module.exports = HistorialMantenimiento;