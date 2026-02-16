const mongoose = require('mongoose');

const puntosUserSchema = new mongoose.Schema(
    {
        documentoUser: {
            type: String,
        },
        puntos: {
            type: String,
        },
        descripcion: {
            type: String,
        },

    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('puntosUsuario', puntosUserSchema);