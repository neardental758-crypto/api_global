const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const AgendamientoOperario = sequelize.define(
  "bc_agendamientos_operarios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    operario_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'bc_usuarios',
        key: 'usu_documento'
      }
    },
    estacion_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dias_semana: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hora_fin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cupos_por_turno: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    crear_cupos_practica: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);
module.exports = AgendamientoOperario;
