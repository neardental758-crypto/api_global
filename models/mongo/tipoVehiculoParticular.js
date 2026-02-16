const mongoose = require('mongoose');

const tipoVehiculoParticularSchema = new mongoose.Schema(
    {
        
        nombre: {
            type: String,
        },

    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('tiposVehiculosParticulares', tipoVehiculoParticularSchema);