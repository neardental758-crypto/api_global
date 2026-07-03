const models = require('../index');
const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Indicadores = sequelize.define(
    "bc_indicadores_trip",
    {
        ind_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ind_usuario: {
            type: DataTypes.STRING,
        },
        ind_viaje: {
            type: DataTypes.STRING,
        },
        ind_modulo: {
            type: DataTypes.STRING,
        },
        ind_duracion: {
            type: DataTypes.STRING,
        },
        ind_distancia: {
            type: DataTypes.STRING,
        },
        ind_calorias: {
            type: DataTypes.STRING,
        },
        ind_co2: {
            type: DataTypes.STRING,
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
                        io.emit('indicator_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting indicator_update in afterUpdate hook:', err.message);
                }
            },
            afterSave: async (instance, options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        io.emit('indicator_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting indicator_update in afterSave hook:', err.message);
                }
            },
            afterBulkUpdate: async (options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        const IndicadoresModel = sequelize.models.bc_indicadores_trip;
                        if (IndicadoresModel && options.where) {
                            const updatedIndicators = await IndicadoresModel.findAll({
                                where: options.where
                            });
                            for (const ind of updatedIndicators) {
                                io.emit('indicator_update', ind.toJSON());
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error emitting indicator_update in afterBulkUpdate hook:', err.message);
                }
            }
        }
    }
);

    module.exports = Indicadores;
