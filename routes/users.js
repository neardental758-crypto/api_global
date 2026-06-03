const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/session');
const { usuarioModels } = require('../models');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign_2 } = require('../utils/handleJwt');

/**
 * POST /api/users/resetpassword
 * Buscar usuario por correo y retornar su identificador para recuperar contraseña
 */
router.post('/resetpassword', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'El correo es requerido' });
        }

        const user = await usuarioModels.findOne({
            where: { usu_email: email.toLowerCase().trim() }
        });

        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'El usuario no existe' });
        }

        return res.json({
            id: user.usu_documento,
            idNumber: user.usu_documento,
            email: user.usu_email
        });
    } catch (error) {
        console.error('Error en /users/resetpassword:', error);
        return res.status(500).json({ error: 'SERVER_ERROR', message: 'Error interno del servidor' });
    }
});

/**
 * POST /api/users/login
 * Simular login para obtener token (usado por patchField_sin_token de las apps)
 */
router.post('/login', async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.status(400).json({ error: 'CREDENTIALS_REQUIRED', message: 'Credenciales requeridas' });
        }

        let isAuthorized = false;
        let userId = '1';

        // Validar credenciales de admin-bc o buscar en la base de datos
        if (user.toLowerCase().trim() === 'admin-bc@gmail.com' && password === '5555') {
            isAuthorized = true;
        } else {
            const dbUser = await usuarioModels.findOne({
                where: { usu_email: user.toLowerCase().trim() }
            });
            if (dbUser) {
                const { compare } = require('../utils/handlePassword');
                const ok = await compare(password, dbUser.usu_password);
                if (ok) {
                    isAuthorized = true;
                    userId = dbUser.usu_documento;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(401).json({ error: 'PASSWORD_INVALID', message: 'Credenciales inválidas' });
        }

        const token = await tokenSign_2({
            role: 'admin',
            permissions: ['all'],
            userId: userId
        });

        return res.json({ token });
    } catch (error) {
        console.error('Error en /users/login:', error);
        return res.status(500).json({ error: 'SERVER_ERROR', message: 'Error interno del servidor' });
    }
});

/**
 * PATCH /api/users/:id
 * Actualizar contraseña del usuario en MySQL (bc_usuarios)
 */
router.patch('/:id', authMiddleware(['all']), async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'PASSWORD_REQUIRED', message: 'La contraseña es requerida' });
        }

        const user = await usuarioModels.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'El usuario no existe' });
        }

        const passwordHash = await encrypt(password);
        await usuarioModels.update(
            { usu_password: passwordHash, usu_updated_at: new Date() },
            { where: { usu_documento: id } }
        );

        return res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error en PATCH /users/:id:', error);
        return res.status(500).json({ error: 'SERVER_ERROR', message: 'Error interno del servidor' });
    }
});

module.exports = router;
