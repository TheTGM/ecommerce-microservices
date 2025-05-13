// index.js o app.js
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./initDatabase');
const ordersRoutes = require('./routes/orders.routes');
const config = require('./config/config');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/orders', ordersRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Orders Service' });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar la base de datos
    await initDatabase();
    
    // Iniciar el servidor
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