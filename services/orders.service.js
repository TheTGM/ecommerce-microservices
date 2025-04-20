const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const productsService = require('./products.service');

// Path a los archivos JSON
const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Función para leer el archivo de órdenes
const getOrders = () => {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de órdenes:', error);
    return [];
  }
};

// Función para escribir en el archivo de órdenes
const saveOrders = (orders) => {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de órdenes:', error);
    return false;
  }
};

/**
 * Servicio de gestión de pedidos
 */
const ordersService = {
  /**
   * Obtiene todas las órdenes
   * @returns {Array} Lista de órdenes
   */
  getAllOrders: () => {
    try {
      const orders = getOrders();
      return { success: true, orders };
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return { success: false, message: 'Error al obtener órdenes' };
    }
  },
  
  /**
   * Obtiene las órdenes de un cliente específico
   * @param {number} clientId - ID del cliente
   * @returns {Array} Lista de órdenes del cliente
   */
  getClientOrders: (clientId) => {
    try {
      const orders = getOrders();
      const clientOrders = orders.filter(order => order.cliente_id === clientId);
      
      return { success: true, orders: clientOrders };
    } catch (error) {
      console.error('Error al obtener órdenes del cliente:', error);
      return { success: false, message: 'Error al obtener órdenes del cliente' };
    }
  },
  
  /**
   * Obtiene una orden por su ID
   * @param {number} orderId - ID de la orden
   * @returns {Object} Orden encontrada o error
   */
  getOrderById: (orderId) => {
    try {
      const orders = getOrders();
      
      const order = orders.find(o => o.numeroPedido === orderId);
      if (!order) {
        return { success: false, message: 'Orden no encontrada' };
      }
      
      return { success: true, order };
    } catch (error) {
      console.error('Error al obtener orden:', error);
      return { success: false, message: 'Error al obtener orden' };
    }
  },
  
  /**
   * Crea una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Object} Orden creada o error
   */
  createOrder: async (orderData) => {
    try {
      const orders = getOrders();
      
      // Validar productos y calcular total
      let total = 0;
      const productos = [];
      
      for (const item of orderData.productos) {
        const productResult = productsService.getProductById(item.producto_id);
        
        if (!productResult.success) {
          return { success: false, message: `Producto ${item.producto_id} no encontrado` };
        }
        
        const producto = productResult.product;
        
        // Verificar stock
        if (producto.stock_disponible < item.cantidad) {
          return { 
            success: false, 
            message: `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock_disponible}`
          };
        }
        
        // Actualizar stock
        const stockResult = productsService.updateStock(producto.id, -item.cantidad);
        if (!stockResult.success) {
          return { success: false, message: stockResult.message };
        }
        
        // Añadir a la lista de productos
        productos.push({
          producto_id: producto.id,
          cantidad: item.cantidad,
          precio_unitario: producto.precio
        });
        
        // Sumar al total
        total += producto.precio * item.cantidad;
      }
      
      // Crear nueva orden
      const newOrder = {
        numeroPedido: orders.length > 0 ? Math.max(...orders.map(o => o.numeroPedido)) + 1 : 1001,
        cliente_id: orderData.cliente_id,
        productos,
        total,
        estadoPedido: config.ORDER_STATUSES.PENDING,
        estadoPago: config.PAYMENT_STATUSES.PENDING,
        metodoPago: orderData.metodoPago,
        dirección: orderData.dirección,
        telefono: orderData.telefono,
        fecha: new Date().toISOString()
      };
      
      // Guardar orden
      orders.push(newOrder);
      saveOrders(orders);
      
      return { success: true, order: newOrder };
    } catch (error) {
      console.error('Error al crear orden:', error);
      return { success: false, message: 'Error al crear orden' };
    }
  },
  
  /**
   * Actualiza el estado de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @returns {Object} Orden actualizada o error
   */
  updateOrderStatus: (orderId, status) => {
    try {
      const orders = getOrders();
      
      const orderIndex = orders.findIndex(o => o.numeroPedido === orderId);
      if (orderIndex === -1) {
        return { success: false, message: 'Orden no encontrada' };
      }
      
      // Validar el estado
      if (!Object.values(config.ORDER_STATUSES).includes(status)) {
        return { success: false, message: 'Estado no válido' };
      }
      
      // Actualizar estado
      orders[orderIndex].estadoPedido = status;
      
      // Guardar cambios
      saveOrders(orders);
      
      return { success: true, order: orders[orderIndex] };
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      return { success: false, message: 'Error al actualizar estado de orden' };
    }
  },
  
  /**
   * Actualiza el estado de pago de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} paymentStatus - Nuevo estado de pago
   * @returns {Object} Orden actualizada o error
   */
  updatePaymentStatus: (orderId, paymentStatus) => {
    try {
      const orders = getOrders();
      
      const orderIndex = orders.findIndex(o => o.numeroPedido === orderId);
      if (orderIndex === -1) {
        return { success: false, message: 'Orden no encontrada' };
      }
      
      // Validar el estado de pago
      if (!Object.values(config.PAYMENT_STATUSES).includes(paymentStatus)) {
        return { success: false, message: 'Estado de pago no válido' };
      }
      
      // Actualizar estado de pago
      orders[orderIndex].estadoPago = paymentStatus;
      
      // Si el pago se completa, actualizar el estado de la orden
      if (paymentStatus === config.PAYMENT_STATUSES.COMPLETED && orders[orderIndex].estadoPedido === config.ORDER_STATUSES.PENDING) {
        orders[orderIndex].estadoPedido = config.ORDER_STATUSES.PROCESSING;
      }
      
      // Guardar cambios
      saveOrders(orders);
      
      return { success: true, order: orders[orderIndex] };
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      return { success: false, message: 'Error al actualizar estado de pago' };
    }
  },
  
  /**
   * Cancela una orden
   * @param {number} orderId - ID de la orden
   * @returns {Object} Resultado de la operación
   */
  cancelOrder: (orderId) => {
    try {
      const orders = getOrders();
      
      const orderIndex = orders.findIndex(o => o.numeroPedido === orderId);
      if (orderIndex === -1) {
        return { success: false, message: 'Orden no encontrada' };
      }
      
      // Verificar si la orden puede ser cancelada
      const order = orders[orderIndex];
      if ([config.ORDER_STATUSES.SHIPPED, config.ORDER_STATUSES.DELIVERED].includes(order.estadoPedido)) {
        return { 
          success: false, 
          message: `No se puede cancelar una orden en estado ${order.estadoPedido}` 
        };
      }
      
      // Restaurar stock
      for (const item of order.productos) {
        productsService.updateStock(item.producto_id, item.cantidad);
      }
      
      // Actualizar estado
      orders[orderIndex].estadoPedido = config.ORDER_STATUSES.CANCELLED;
      
      // Guardar cambios
      saveOrders(orders);
      
      return { 
        success: true, 
        message: 'Orden cancelada correctamente',
        order: orders[orderIndex]
      };
    } catch (error) {
      console.error('Error al cancelar orden:', error);
      return { success: false, message: 'Error al cancelar orden' };
    }
  }
};

module.exports = ordersService;