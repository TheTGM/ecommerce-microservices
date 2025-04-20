const jwt = require('jsonwebtoken');
const config = require('../config/config');
const usersData = require('../data/users.json');

/**
 * Middleware para verificar el token JWT
 */
exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({
      status: 'error',
      message: 'No token provided'
    });
  }
  
  // Eliminar 'Bearer ' si está presente
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
  
  try {
    const decoded = jwt.verify(tokenValue, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware para verificar si el usuario es admin
 */
exports.isAdmin = (req, res, next) => {
  // Ya debe haber pasado por verifyToken
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      message: 'No authenticated user'
    });
  }
  
  const userId = req.user.id;
  const user = usersData.find(u => u.id === userId);
  
  if (!user || user.rol !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Require admin role'
    });
  }
  
  next();
};

/**
 * Middleware para verificar roles específicos
 */
exports.hasRole = (roles) => {
  return (req, res, next) => {
    // Ya debe haber pasado por verifyToken
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'No authenticated user'
      });
    }
    
    const userId = req.user.id;
    const user = usersData.find(u => u.id === userId);
    
    if (!user || !roles.includes(user.rol)) {
      return res.status(403).json({
        status: 'error',
        message: `Require one of these roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};