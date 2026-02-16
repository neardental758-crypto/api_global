// middlewares/checkPrestamoActivo.js
const { prestamosModels } = require("../models");

const checkPrestamoActivo = async (req, res, next) => {
    try {
        const { pre_usuario } = req.body;

        if (!pre_usuario) {
            return res.status(409).json({
                success: false,
                message: "❌ El campo pre_usuario es obligatorio"
            });
        }

        // Buscar préstamo activo
        const prestamoActivo = await prestamosModels.findOne({
            where: {
                pre_usuario,
                pre_estado: "ACTIVA"
            }
        });

        if (prestamoActivo) {
            return res.status(409).json({
                success: false,
                message: "❌ El usuario ya tiene un préstamo activo y no puede generar otro."
            });
        }

        // ✅ Si no tiene préstamos activos, continúa al siguiente middleware/controlador
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error verificando préstamo activo: ${error.message}`
        });
    }
};

module.exports = checkPrestamoActivo;
