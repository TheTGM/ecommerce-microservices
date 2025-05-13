// index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDatabase } = require('./initDatabase');

// Importar rutas
const paymentsRoutes = require('./routes/payments.routes');

// Configuración
const config = require('./config/config');

// Inicializar app
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/api/payments', paymentsRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Pagos',
    service: 'Payments Microservice',
    version: '1.0.0'
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar la base de datos
    await initDatabase();
    
    // Iniciar servidor
    app.listen(config.PORT, () => {
      console.log(`Servidor de pagos corriendo en http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer();

module.exports = app;