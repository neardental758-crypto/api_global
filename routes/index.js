const express = require('express');
const fs = require('fs');
const router = express.Router();

//ruta absoluta
const PATH_ROUTES = __dirname;

//función pra remover la extensión del archivo de la carpeta de routers
const removeExtension = (fileName) => {
    return fileName.split('.').shift();
}

/**
 * El método "readdirSync" devuelve una arreglo con todos los nombres de archivos
 * u objetos en el directorio
 */
fs.readdirSync(PATH_ROUTES).filter((file) => {
    const name = removeExtension(file)

    if (name != 'index') {
        //requerimos el archivo que se llame por el cliente (navegador)
        router.use(`/${name}`, require(`./${file}`))
    }
})

module.exports = router
