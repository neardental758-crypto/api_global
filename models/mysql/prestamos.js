const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Prestamos = sequelize.define(
    "bc_prestamos",
    {
        pre_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pre_hora_server: {
            type: DataTypes.STRING,
        },
        pre_usuario: {
            type: DataTypes.STRING,
        },
        pre_bicicleta: {
            type: DataTypes.INTEGER,
        },
        pre_retiro_estacion: {
            type: DataTypes.STRING,
        },
        pre_retiro_fecha: {
            type: DataTypes.DATE,
        },
        pre_retiro_hora: {
            type: DataTypes.STRING,
        },
        pre_devolucion_estacion: {
            type: DataTypes.STRING,
        },
        pre_devolucion_fecha: {
            type: DataTypes.DATE,
        },
        pre_devolucion_hora: {
            type: DataTypes.STRING,
        },
        pre_duracion: {
            type: DataTypes.STRING,
        },
        pre_dispositivo: {
            type: DataTypes.STRING,
        },
        pre_estado: {
            type: DataTypes.STRING,
        },
        pre_finalizado_por: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pre_modulo: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: false,
        hooks: {
            afterUpdate: async (instance, options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        io.emit('loan_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting loan_update in afterUpdate hook:', err.message);
                }
            },
            afterSave: async (instance, options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        io.emit('loan_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting loan_update in afterSave hook:', err.message);
                }
            },
            afterBulkUpdate: async (options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        const PrestamosModel = sequelize.models.bc_prestamos;
                        if (PrestamosModel && options.where) {
                            const updatedLoans = await PrestamosModel.findAll({
                                where: options.where
                            });
                            for (const loan of updatedLoans) {
                                io.emit('loan_update', loan.toJSON());
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error emitting loan_update in afterBulkUpdate hook:', err.message);
                }
            }
        }
    }
);

module.exports = Prestamos;