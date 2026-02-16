const mongoose = require('mongoose');

const registroVehiculoParticularSchema = new mongoose.Schema(
    {
        codigoQR: {
            type: String,
        },
        tipo: {
            type: String,
        },
        marca: {
            type: String,
        },
        modelo: {
            type: String,
        },
        color: {
            type: String,
        },
        serial: {
            type: String,
        },
    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('registrovehiculoParticular', registroVehiculoParticularSchema);