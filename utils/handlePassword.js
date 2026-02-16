const bcryptjs = require('bcryptjs');

/**
 * pasamos el texto plano sin encriptar
 * @param {*} passwordPlain 
 */

const encrypt = async (passwordPlain)=>{
    const hash = await bcryptjs.hash(passwordPlain, 10);
    return hash;
}


/**
 * pasar contraseña sin y encriptada
 * @param {*} passwordPlain 
 * @param {*} hashPassword 
 */
const compare = async (passwordPlain, hashPassword)=>{
    return await bcryptjs.compare(passwordPlain, hashPassword);
}

module.exports = { encrypt, compare };