// services/orders.service.js
const Order = require('../model/order');
const OrderProduct = require('../model/orderProduct');
const productsService = require('../../services/products.service');
const config = require('../config/config');
const sequelize = require('../config/database');

/**
 * Servicio de gestión de pedidos con SQLite
 */
const ordersService = {
  /**
   * Obtiene todas las órdenes
   * @returns {Object} Lista de órdenes
   */
  getAllOrders: async () => {
    try {
      const orders = await Order.findAll({
        include: [{
          model: OrderProduct,
          as: 'productos'
        }],
        order: [['fecha', 'DESC']]
      });

      return { success: true, orders };
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return { success: false, message: 'Error al obtener órdenes' };
    }
  },

  /**
   * Obtiene las órdenes de un cliente específico
   * @param {number} clientId - ID del cliente
   * @returns {Object} Lista de órdenes del cliente
   */
  getClientOrders: async (clientId) => {
    try {
      const orders = await Order.findAll({
        where: { cliente_id: clientId },
        include: [{
          model: OrderProduct,
          as: 'productos'
        }],
        order: [['fecha', 'DESC']]
      });

      return { success: true, orders };
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
  getOrderById: async (orderId) => {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{
          model: OrderProduct,
          as: 'productos'
        }]
      });

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
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // Validar productos y calcular total
      let total = 0;
      const productos = [];

      for (const item of orderData.productos) {
        const productResult = await productsService.getProductById(item.producto_id);

        if (!productResult.success) {
          await transaction.rollback();
          return { success: false, message: `Producto ${item.producto_id} no encontrado` };
        }

        const producto = productResult.product;

        // Verificar stock
        if (producto.stock_disponible < item.cantidad) {
          await transaction.rollback();
          return {
            success: false,
            message: `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock_disponible}`
          };
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
      const newOrder = await Order.create({
        cliente_id: orderData.cliente_id,
        total,
        estadoPedido: config.ORDER_STATUSES.PENDING,
        estadoPago: config.PAYMENT_STATUSES.PENDING,
        metodoPago: orderData.metodoPago,
        direccion: orderData.dirección,
        telefono: orderData.telefono
      }, { transaction });

      // Crear los productos de la orden
      for (const item of productos) {
        await OrderProduct.create({
          order_id: newOrder.numeroPedido,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }, { transaction });

        // Actualizar stock
        const stockResult = await productsService.updateStock(
          item.producto_id,
          -item.cantidad,
          transaction // Pasar la transacción al servicio de productos
        );

        if (!stockResult.success) {
          await transaction.rollback();
          return { success: false, message: stockResult.message };
        }
      }

      // Confirmar transacción
      await transaction.commit();

      // Obtener la orden completa con productos
      const orderWithProducts = await Order.findByPk(newOrder.numeroPedido, {
        include: [{
          model: OrderProduct,
          as: 'productos'
        }]
      });

      return { success: true, order: orderWithProducts };
    } catch (error) {
      await transaction.rollback();
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
  updateOrderStatus: async (orderId, status) => {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return { success: false, message: 'Orden no encontrada' };
      }

      // Validar el estado
      if (!Object.values(config.ORDER_STATUSES).includes(status)) {
        return { success: false, message: 'Estado no válido' };
      }

      // Actualizar estado
      order.estadoPedido = status;
      await order.save();

      return { success: true, order };
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
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return { success: false, message: 'Orden no encontrada' };
      }

      // Validar el estado de pago
      if (!Object.values(config.PAYMENT_STATUSES).includes(paymentStatus)) {
        return { success: false, message: 'Estado de pago no válido' };
      }

      // Actualizar estado de pago
      order.estadoPago = paymentStatus;

      // Si el pago se completa, actualizar el estado de la orden
      if (paymentStatus === config.PAYMENT_STATUSES.COMPLETED &&
        order.estadoPedido === config.ORDER_STATUSES.PENDING) {
        order.estadoPedido = config.ORDER_STATUSES.PROCESSING;
      }

      await order.save();

      return { success: true, order };
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
  cancelOrder: async (orderId) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [{
          model: OrderProduct,
          as: 'productos'
        }],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return { success: false, message: 'Orden no encontrada' };
      }

      // Verificar si la orden puede ser cancelada
      if ([config.ORDER_STATUSES.SHIPPED, config.ORDER_STATUSES.DELIVERED].includes(order.estadoPedido)) {
        await transaction.rollback();
        return {
          success: false,
          message: `No se puede cancelar una orden en estado ${order.estadoPedido}`
        };
      }

      // Restaurar stock
      for (const item of order.productos) {
        const stockResult = await productsService.updateStock(
          item.producto_id,
          item.cantidad,
          transaction
        );

        if (!stockResult.success) {
          await transaction.rollback();
          return { success: false, message: stockResult.message };
        }
      }

      // Actualizar estado
      order.estadoPedido = config.ORDER_STATUSES.CANCELLED;
      await order.save({ transaction });

      // Confirmar transacción
      await transaction.commit();

      return {
        success: true,
        message: 'Orden cancelada correctamente',
        order
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error al cancelar orden:', error);
      return { success: false, message: 'Error al cancelar orden' };
    }
  }
};

module.exports = ordersService;