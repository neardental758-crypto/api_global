const mongoose = require('mongoose');

const empresasSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        url: {
            type: String,
        },
        estado:{
            type: String,
        }
    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('empresas', empresasSchema);