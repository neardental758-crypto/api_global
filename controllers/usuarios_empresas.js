

const { usuarioModels, UsuarioEmpresas , empresaModels } = require('../models');

const normalizeEmpresaIds = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            return [raw];
        } catch (e) {
            return [raw];
        }
    }
    return [];
};

const resolveEmpresaNombre = async (empresaId) => {
    if (!empresaId) return '';

    const empresa = await empresaModels.findOne({
        where: { emp_id: empresaId }
    });
    if (empresa && empresa.emp_nombre) return empresa.emp_nombre;

    const empresaByNombre = await empresaModels.findOne({
        where: { emp_nombre: empresaId }
    });
    if (empresaByNombre && empresaByNombre.emp_nombre) return empresaByNombre.emp_nombre;

    return String(empresaId);
};

// Controlador
const getAllUsuariosEmpresas = async (req, res) => {
    try {
        const data = await UsuarioEmpresas.findAll({
            include: [
                {
                    model: usuarioModels,
                    as: 'usuario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_rol_dash']
                }
            ]
        });

        const processedData = await Promise.all(data.map(async (item) => {
            const empresaIds = normalizeEmpresaIds(item.empresa_ids);
            const empresaNames = await Promise.all(
                empresaIds.map(async (empresaId) => {
                    return await resolveEmpresaNombre(empresaId);
                })
            );

            return {
                id: item.id,
                usu_documento: item.usu_documento,
                usu_nombre: item.usuario ? item.usuario.usu_nombre : 'Usuario no encontrado',
                empresa_ids: empresaIds,
                empresa_names: empresaNames,
                created_at: item.created_at,
                updated_at: item.updated_at
            };
        }));

        res.status(200).send({
            data: processedData,
            total: processedData.length,
            message: "Usuarios empresas obtenidos correctamente"
        });

    } catch (error) {
        console.error("Error al obtener usuarios empresas:", error);
        res.status(500).send({
            error: "ERROR_GET_USUARIOS_EMPRESAS",
            message: "Error al obtener los usuarios empresas"
        });
    }
};

const getUsuarioEmpresas = async (req, res) => {
    try {
        const { usu_documento } = req.params;
        
        const usuarioEmpresas = await UsuarioEmpresas.findOne({
            where: { usu_documento },
            include: [
                {
                    model: usuarioModels,
                    as: 'usuario',
                    attributes: ['usu_documento', 'usu_nombre', 'usu_rol_dash']
                }
            ]
        });
        
        if (!usuarioEmpresas) {
            return res.status(404).send({ 
                error: "USUARIO_EMPRESAS_NO_ENCONTRADO",
                message: "No se encontraron empresas asignadas para este usuario" 
            });
        }

        const empresaIds = normalizeEmpresaIds(usuarioEmpresas.empresa_ids);
        const empresaNames = await Promise.all(
            empresaIds.map(async (empresaId) => {
                return await resolveEmpresaNombre(empresaId);
            })
        );
        
        res.status(200).send({
            data: {
                id: usuarioEmpresas.id,
                usu_documento: usuarioEmpresas.usu_documento,
                usu_nombre: usuarioEmpresas.usuario ? usuarioEmpresas.usuario.usu_nombre : 'Usuario no encontrado',
                empresa_ids: empresaIds,
                empresa_names: empresaNames,
                created_at: usuarioEmpresas.created_at,
                updated_at: usuarioEmpresas.updated_at
            },
            message: "Usuario empresas obtenido correctamente"
        });
        
    } catch (error) {
        console.error("Error al obtener usuario empresas:", error);
        res.status(500).send({
            error: "ERROR_GET_USUARIO_EMPRESAS",
            message: "Error al obtener el usuario empresas"
        });
    }
};

const createUsuarioEmpresas = async (req, res) => {
    try {
        const { usu_documento, empresa_ids } = req.body;
        const empresaIds = normalizeEmpresaIds(empresa_ids);
        
        const usuarioExistente = await UsuarioEmpresas.findOne({
            where: { usu_documento }
        });
        
        if (usuarioExistente) {
            await UsuarioEmpresas.update(
                { empresa_ids: empresaIds },
                { where: { usu_documento } }
            );

            const updatedData = await UsuarioEmpresas.findOne({ where: { usu_documento } });
            return res.status(200).send({
                data: updatedData,
                message: "Usuario empresas actualizado correctamente"
            });
        }

        const data = await UsuarioEmpresas.create({
            usu_documento,
            empresa_ids: empresaIds
        });
        
        res.status(201).send({
            data,
            message: "Usuario empresas creado correctamente"
        });
        
    } catch (error) {
        console.error("Error al crear usuario empresas:", error);
        res.status(500).send({
            error: "ERROR_CREATE_USUARIO_EMPRESAS",
            message: "Error al crear el usuario empresas"
        });
    }
};

const updateUsuarioEmpresas = async (req, res) => {
    try {
        const { usu_documento } = req.params;
        const { empresa_ids } = req.body;
        
        const [affectedRows] = await UsuarioEmpresas.update(
            { empresa_ids: empresa_ids || [] },
            { where: { usu_documento } }
        );

        if (affectedRows === 0) {
            return res.status(404).send({
                error: "USUARIO_EMPRESAS_NO_ENCONTRADO",
                message: "No se encontró el usuario empresas para actualizar"
            });
        }

        const updatedData = await UsuarioEmpresas.findOne({
            where: { usu_documento }
        });

        res.status(200).send({
            data: updatedData,
            message: "Usuario empresas actualizado correctamente"
        });
        
    } catch (error) {
        console.error("Error al actualizar usuario empresas:", error);
        res.status(500).send({
            error: "ERROR_UPDATE_USUARIO_EMPRESAS",
            message: "Error al actualizar el usuario empresas"
        });
    }
};

const deleteUsuarioEmpresas = async (req, res) => {
    try {
        const { usu_documento } = req.params;
        
        const affectedRows = await UsuarioEmpresas.destroy({
            where: { usu_documento }
        });

        if (affectedRows === 0) {
            return res.status(404).send({
                error: "USUARIO_EMPRESAS_NO_ENCONTRADO",
                message: "No se encontró el usuario empresas para eliminar"
            });
        }

        res.status(200).send({
            message: "Usuario empresas eliminado correctamente"
        });
        
    } catch (error) {
        console.error("Error al eliminar usuario empresas:", error);
        res.status(500).send({
            error: "ERROR_DELETE_USUARIO_EMPRESAS",
            message: "Error al eliminar el usuario empresas"
        });
    }
};

const getEmpresasAsignadas = async (req, res) => {
    try {
        const { usu_documento } = req.params;
        
        const usuarioEmpresas = await UsuarioEmpresas.findOne({
            where: { usu_documento }
        });
        
        if (!usuarioEmpresas) {
            return res.status(200).send({ 
                data: null,
                message: "Usuario sin empresas asignadas" 
            });
        }

        const empresaIds = normalizeEmpresaIds(usuarioEmpresas.empresa_ids).map((id) =>
            String(id || ""),
        );

        res.status(200).send({
            data: empresaIds,
            message: "Empresas asignadas obtenidas correctamente"
        });
        
    } catch (error) {
        console.error("Error al obtener empresas asignadas:", error);
        res.status(500).send({
            error: "ERROR_GET_EMPRESAS_ASIGNADAS",
            message: "Error al obtener las empresas asignadas del usuario"
        });
    }
};

module.exports = {
    getAllUsuariosEmpresas, getUsuarioEmpresas, createUsuarioEmpresas, updateUsuarioEmpresas, deleteUsuarioEmpresas,getEmpresasAsignadas
}
