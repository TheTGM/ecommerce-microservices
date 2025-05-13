// initDatabase.js
const sequelize = require('./config/database');
const Payment = require('./model/payment');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    // Probar la conexión
    await sequelize.authenticate();
    console.log('Conexión con SQLite establecida correctamente.');
    
    // Sincronizar modelos (esto creará las tablas si no existen)
    await sequelize.sync({ force: false }); // Usar force: true para recrear las tablas
    console.log('Modelos sincronizados.');
    
    // Verificar si hay datos en la base de datos
    const paymentCount = await Payment.count();
    
    if (paymentCount === 0) {
      console.log('Base de datos vacía. Importando datos iniciales...');
      await importInitialData();
    } else {
      console.log(`Base de datos ya contiene ${paymentCount} pagos.`);
    }
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

async function importInitialData() {
  try {
    // Leer el archivo de datos
    const dataPath = path.join(__dirname, './data/payments.json');
    const paymentsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Usar una transacción para asegurar la integridad de los datos
    const transaction = await sequelize.transaction();
    
    try {
      for (const paymentData of paymentsData) {
        await Payment.create({
          id: paymentData.id,
          pedido_id: paymentData.pedido_id,
          transaccion_id: paymentData.transaccion_id,
          respuesta: paymentData.respuesta,
          estado: paymentData.estado,
          monto: paymentData.monto,
          pasarela: paymentData.pasarela,
          fecha: paymentData.fecha
        }, { transaction });
      }
      
      await transaction.commit();
      console.log('Datos iniciales importados correctamente.');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al importar datos iniciales:', error);
    throw error;
  }
}

module.exports = { initDatabase };

// Si se ejecuta directamente, inicializar la base de datos
if (require.main === module) {
  initDatabase().then(() => {
    console.log('Inicialización completada.');
    process.exit(0);
  });
}