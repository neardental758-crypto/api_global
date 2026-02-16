const { httpError } = require('../utils/handleError');
 
/**
 * pasar los roles permitidos
 * @param {*} roles 
 * @returns 
 */
const checkRol = (roles) => (req, res, next) =>{
    try {
        //creamos constante cpn destructuración del req
        const { user } = req;
        //constante con el rol del usuario
        const rolesByUser = user.rol;
        //valida que lo que venga en la variable roles que es 'admin' esté incluido en la informacion del usuario que viene en el token y el rol coincida con el que se envia desde la ruta en este caso solo ingresa o consume quien tenga rol "admin"
        const checkValueRol = roles.some((rolunico)=> 
            rolesByUser.includes(rolunico)
        );
        //si no coincide con admin error de usario no tiene permisos y sale del flujo
        if (!checkValueRol) {
            httpError(res, "USER_NOT_PERMISSIONS", 403)
            return;
        }
        //si coincide sigue el flujo del programa
        next();
    } catch (e) {
        httpError(res, "ERROR_PERMISSIONS", 403)
    }
}

module.exports = checkRol;