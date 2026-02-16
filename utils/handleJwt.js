const jsonwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const getProperties = require('../utils/handleMotordb');
const propertiesKey = getProperties();
/**
 * pasar el objeto del usuario
 * @param {*} user 
 */
const tokenSign = async (user) =>{
    const sign = await jsonwebtoken.sign(
        {
            [propertiesKey.iat]: user[propertiesKey.iat],
            [propertiesKey.exp]: user[propertiesKey.exp],
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    )
    return sign;
}

const tokenSign_2 = async (user) => {
    const sign = await jsonwebtoken.sign(
        {
            iat: Math.floor(Date.now() / 1000), // Tiempo actual en segundos
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // Expira en 365 días
            role: user.role, // Puedes agregar cualquier otro dato relevante
        },
        JWT_SECRET
    );
    return sign;
};

/**
 * pasar token de sesion JWT
 * @param {*} tokenJwt 
 * @returns 
 */
const verifyToken = async (tokenJwt) =>{
    try {
        return jsonwebtoken.verify(tokenJwt, JWT_SECRET)
    } catch (e) {
        return null;
    }
}

module.exports = { tokenSign, tokenSign_2, verifyToken }