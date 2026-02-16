const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const AgendamientoIncumplido = sequelize.define(
  "bc_agendamientos_incumplidos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agendamiento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bc_agendamientos_operarios',
        key: 'id'
      }
    },
    operario_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estacion_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dia_semana: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_incumplimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revisado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    timestamps: false
  }
);

module.exports = AgendamientoIncumplido;
