const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema(
    {
        documentoUser: {
            type: String,
        },
        registroInicial: {
            type: String,
        },
        fechaNacimiento: {
            type: String,
        },
        fechaNacimientoEstado:{
            type: Boolean,
        },
        genero:{
            type: String,
        },
        generoEstado:{
            type: Boolean,
        },

        direccion:{
            type: String,
        },
        direccionEstado:{
            type: Boolean,
        },
        transporte:{
            type: String,
        },
        transporteEstado:{
            type: Boolean,
        },
        tiempoCT:{
            type: String,
        },
        tiempoCTEstado:{
            type: Boolean,
        },
        tiempoTC:{
            type: String,
        },
        tiempoTCEstado:{
            type: Boolean,
        },
        diasTrabajo:{
            type: String,
        },
        diasTrabajoEstado:{
            type: Boolean,
        },
        satisfaccion:{
            type: String,
        },
        satisfaccionEstado:{
            type: Boolean,
        },
        dineroAhorro:{
            type: String,
        },
        dineroAhorroEstado:{
            type: Boolean,
        },
        factor:{
            type: String,
        },
        factorEstado:{
            type: Boolean,
        },
        habilidad:{
            type: String,
        },
        habilidadEstado:{
            type: Boolean,
        },
        alternativa:{
            type: String,
        },
        alternativaEstado:{
            type: Boolean,
        },

        barreras:{
            type: String,
        },
        barrerasEstado:{
            type: Boolean,
        },
        beneficios:{
            type: String,
        },
        beneficiosEstado:{
            type: Boolean,
        },
        daviviendaBici:{
            type: String,
        },
        daviviendaBiciEstado:{
            type: Boolean,
        },
        intentarMoviBicielec:{
            type: String,
        },
        intentarMoviBicielecEstado:{
            type: Boolean,
        },
        puedenMotivar:{
            type: String,
        },
        puedenMotivarEstado:{
            type: Boolean,
        },
        diasEjercicio:{
            type: String,
        },
        diasEjercicioEstado:{
            type: Boolean,
        },

        vehiculoCompartido:{
            type: String,
        },
        vehiculoPropio:{
            type: String,
        },
        vehiculoCarroPool:{
            type: String,
        },
        estacionamientoCompartido:{
            type: String,
        },

    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('registro', registroSchema);