/**
 * Middleware para capturar errores en las rutas
 */
const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Error interno del servidor'
    });
  };
  
  module.exports = errorHandler;