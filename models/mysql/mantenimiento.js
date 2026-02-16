const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

// Modelo de Mantenimientos
const Mantenimiento = sequelize.define(
    "bc_mantenimientos",
    {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    empresa_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
    model: 'bc_empresas',
    key: 'emp_id'
    }
    },
    bicicleta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
    model: 'bc_bicicletas',
    key: 'bic_id'
    }
    },operario_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
    model: 'bc_usuarios',
    key: 'usu_documento'
    }
    },
    fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
    },
    fecha_finalizacion: {
    type: DataTypes.DATE,
    allowNull: true
    },
    comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    bicicleta_password: {
    type: DataTypes.INTEGER,
    allowNull: true
    },
    tipo_mantenimiento: {
    type: DataTypes.STRING,
    allowNull: false
    },
    estado: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'finalizado', 'cancelado'),
    defaultValue: 'pendiente'
    },
    prioridad: {       type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),       defaultValue: 'media'     },
    estacion_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
    }
);

    module.exports = Mantenimiento;