const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @route POST /api/auth/register
 * @desc Registrar un nuevo usuario
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      user: result.user
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    
    if (!correo || !contraseña) {
      return res.status(400).json({
        status: 'error',
        message: 'Correo y contraseña son requeridos'
      });
    }
    
    const result = await authService.login(correo, contraseña);
    
    if (!result.success) {
      return res.status(401).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = authService.getUserById(userId);
    
    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      user: result.user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PUT /api/auth/profile
 * @desc Actualizar perfil del usuario autenticado
 * @access Private
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;
    
    // No permitir cambiar el rol desde aquí
    delete userData.rol;
    
    const result = await authService.updateUser(userId, userData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado exitosamente',
      user: result.user
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/auth/users
 * @desc Obtener todos los usuarios (solo admin)
 * @access Private/Admin
 */
router.get('/users', [verifyToken, isAdmin], async (req, res) => {
  try {
    // Simple simulación de obtener usuarios - en producción se usaría un servicio real
    const users = require('../data/users.json');
    
    // Eliminar contraseñas
    const usersWithoutPasswords = users.map(user => {
      const { contraseña, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      status: 'success',
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verificar token JWT
 * @access Public
 */
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token válido',
    user: req.user
  });
});

module.exports = router;