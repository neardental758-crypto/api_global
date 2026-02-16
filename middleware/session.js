const { httpError } = require('../utils/handleError');
const { verifyToken } = require('../utils/handleJwt')

const authMiddleware = (requiredPermissions = []) => {
    return async (req, res, next) => {
      try {
        if (!req.headers.authorization) {
          httpError(res, "NEED_SESSION", 401);
          return;
        }
        const token = req.headers.authorization.split(' ').pop();
        // Verificar el token
        const dataToken = await verifyToken(token);
        // Validar que el token contenga datos
        if (!dataToken) {
          httpError(res, "NOT JWT", 401);
          return;
        }
        // Extraer los permisos del token
        const { permissions } = dataToken;
        // Verificar si el permiso es "none", bloquea el acceso
        if (permissions === 'none') {
          httpError(res, "ACCESS_DENIED", 403);
          return;
        }
  
        // Si se requieren permisos específicos en la ruta, verificar si el usuario tiene alguno de esos permisos
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => permissions.includes(permission));
          if (!hasPermission) {
            httpError(res, "ACCESS_DENIED", 403);
            return;
          }
        }
        // Si pasa las verificaciones, deja pasar la solicitud
        next();
      } catch (e) {
        httpError(res, "NOT_SESSION", 401);
      }
    };
  };

module.exports = authMiddleware;
