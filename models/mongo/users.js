const mongoose = require('mongoose');

const chema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        password:{
            type: String,
            select: false,
        },
        rol: {
            type: ["user", "admin", "tecnico", "gestor"],
            default: "user",
        }
    },{
        timestamps: true,
        versionKey: false,
    }
)

module.exports = mongoose.model('users', userSchema);