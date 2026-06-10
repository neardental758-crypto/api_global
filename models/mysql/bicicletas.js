const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Bicicleta = sequelize.define(
    "bc_bicicletas",
    {
        bic_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bic_nombre: {
            type: DataTypes.STRING,
        },
        bic_numero: {
            type: DataTypes.STRING,
        },
        bic_estacion: {
            type: DataTypes.STRING,
        },
        bic_estado: {
            type: DataTypes.STRING,
        },
        bic_descripcion: {
            type: DataTypes.STRING,
        },
        bic_created_at: {
            type: DataTypes.DATE,
        },
        bic_updated_at: {
            type: DataTypes.DATE,
        },
        bic_bluetooth: {
            type: DataTypes.STRING,
        },
        bic_clave: {
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
                        io.emit('bike_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting bike_update in afterUpdate hook:', err.message);
                }
            },
            afterSave: async (instance, options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        io.emit('bike_update', instance.toJSON());
                    }
                } catch (err) {
                    console.error('Error emitting bike_update in afterSave hook:', err.message);
                }
            },
            afterBulkUpdate: async (options) => {
                try {
                    const { getIo } = require('../../services/socketIoService');
                    const io = getIo();
                    if (io) {
                        const BicicletaModel = sequelize.models.bc_bicicletas;
                        if (BicicletaModel && options.where) {
                            const updatedBikes = await BicicletaModel.findAll({
                                where: options.where
                            });
                            for (const bike of updatedBikes) {
                                io.emit('bike_update', bike.toJSON());
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error emitting bike_update in afterBulkUpdate hook:', err.message);
                }
            }
        }
    }
);

module.exports = Bicicleta;