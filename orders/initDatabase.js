const sequelize = require('./config/database');
const Order = require('./model/order');
const OrderProduct = require('./model/orderProduct');
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
    const orderCount = await Order.count();
    
    if (orderCount === 0) {
      console.log('Base de datos vacía. Importando datos iniciales...');
      await importInitialData();
    } else {
      console.log(`Base de datos ya contiene ${orderCount} órdenes.`);
    }
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

async function importInitialData() {
  try {
    // Leer el archivo de datos
    const dataPath = path.join(__dirname, './data/orders.json');
    const ordersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Usar una transacción para asegurar la integridad de los datos
    const transaction = await sequelize.transaction();
    
    try {
      for (const orderData of ordersData) {
        // Crear la orden
        const order = await Order.create({
          numeroPedido: orderData.numeroPedido,
          cliente_id: orderData.cliente_id,
          total: orderData.total,
          estadoPedido: orderData.estadoPedido,
          estadoPago: orderData.estadoPago,
          metodoPago: orderData.metodoPago,
          direccion: orderData.dirección,
          telefono: orderData.telefono,
          fecha: orderData.fecha
        }, { transaction });
        
        // Crear los productos de la orden
        for (const producto of orderData.productos) {
          await OrderProduct.create({
            order_id: order.numeroPedido,
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario
          }, { transaction });
        }
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