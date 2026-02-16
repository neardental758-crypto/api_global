const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

// 3. Modelo de Estado de Componentes
const EstadoComponente = sequelize.define(
    "bc_estado_componentes",
    {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    bicicleta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
    model: 'bc_bicicletas',
    key: 'bic_id'
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
    estado: {
    type: DataTypes.ENUM('ok', 'cambio', 'ajuste', 'arreglo', 'revisión'),
    defaultValue: 'ok'
    },
    ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
    }
    }
    );
    module.exports = EstadoComponente;