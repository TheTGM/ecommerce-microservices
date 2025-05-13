// services/payments.service.js
const Payment = require('../model/payment');
const config = require('../config/config');
const sequelize = require('../config/database');
const ordersClient = require('./orders.client');

// ==================== ABSTRACT FACTORY PATTERN ====================

/**
 * Procesador de Pagos Abstracto
 * Define la interfaz para todos los procesadores de pago
 */
class PaymentProcessor {
  processPayment(order) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  getPaymentStatus(transactionId) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  cancelPayment(transactionId) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }
}

/**
 * Gestor de Reembolsos Abstracto
 * Define la interfaz para todos los gestores de reembolso
 */
class RefundManager {
  processRefund(transactionId, amount) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  getRefundStatus(refundId) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }
}

/**
 * Procesador de Pagos de PayPal
 */
class PayPalPaymentProcessor extends PaymentProcessor {
  processPayment(order) {
    console.log(`[PayPal] Procesando pago para la orden #${order.numeroPedido}`);
    console.log(`[PayPal] Monto: $${order.total}`);

    // Simulación de procesamiento de pago con PayPal
    const isSuccessful = Math.random() > 0.1; // 90% de éxito
    
    if (isSuccessful) {
      return {
        success: true,
        transactionId: `PP-${Date.now()}`,
        message: "Pago procesado exitosamente a través de PayPal",
      };
    } else {
      return {
        success: false,
        message: "Error al procesar el pago con PayPal. Por favor, intente nuevamente."
      };
    }
  }

  getPaymentStatus(transactionId) {
    console.log(`[PayPal] Consultando estado del pago ${transactionId}`);

    // Simulación de consulta de estado
    return {
      transactionId,
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };
  }

  cancelPayment(transactionId) {
    console.log(`[PayPal] Cancelando pago ${transactionId}`);

    // Simulación de cancelación
    return {
      success: true,
      message: "Pago cancelado exitosamente",
    };
  }
}

/**
 * Gestor de Reembolsos de PayPal
 */
class PayPalRefundManager extends RefundManager {
  processRefund(transactionId, amount) {
    console.log(`[PayPal] Procesando reembolso de $${amount} para la transacción ${transactionId}`);

    // Simulación de procesamiento de reembolso
    return {
      success: true,
      refundId: `PPR-${Date.now()}`,
      message: "Reembolso procesado exitosamente",
    };
  }

  getRefundStatus(refundId) {
    console.log(`[PayPal] Consultando estado del reembolso #${refundId}`);

    // Simulación de consulta de estado
    return {
      refundId,
      status: "COMPLETED",
      processedAt: new Date().toISOString(),
    };
  }
}

/**
 * Procesador de Pagos de Stripe
 */
class StripePaymentProcessor extends PaymentProcessor {
  processPayment(order) {
    console.log(`[Stripe] Procesando pago para la orden #${order.numeroPedido}`);
    console.log(`[Stripe] Monto: $${order.total}`);

    // Simulación de procesamiento de pago con Stripe
    const isSuccessful = Math.random() > 0.1; // 90% de éxito
    
    if (isSuccessful) {
      return {
        success: true,
        transactionId: `ST-${Date.now()}`,
        message: "Pago procesado exitosamente a través de Stripe",
      };
    } else {
      return {
        success: false,
        message: "Error al procesar el pago con Stripe. Por favor, intente nuevamente."
      };
    }
  }

  getPaymentStatus(transactionId) {
    console.log(`[Stripe] Consultando estado del pago ${transactionId}`);

    // Simulación de consulta de estado
    return {
      transactionId,
      status: "SUCCEEDED",
      updatedAt: new Date().toISOString(),
    };
  }

  cancelPayment(transactionId) {
    console.log(`[Stripe] Cancelando pago ${transactionId}`);

    // Simulación de cancelación
    return {
      success: true,
      message: "Pago cancelado exitosamente",
    };
  }
}

/**
 * Gestor de Reembolsos de Stripe
 */
class StripeRefundManager extends RefundManager {
  processRefund(transactionId, amount) {
    console.log(`[Stripe] Procesando reembolso de $${amount} para la transacción ${transactionId}`);

    // Simulación de procesamiento de reembolso
    return {
      success: true,
      refundId: `STR-${Date.now()}`,
      message: "Reembolso procesado exitosamente",
    };
  }

  getRefundStatus(refundId) {
    console.log(`[Stripe] Consultando estado del reembolso #${refundId}`);

    // Simulación de consulta de estado
    return {
      refundId,
      status: "SUCCEEDED",
      processedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fábrica Abstracta de Procesadores de Pago
 */
class PaymentProcessorFactory {
  static createPaymentProcessor(gateway) {
    if (gateway === 'paypal') {
      return new PayPalPaymentProcessor();
    } else if (gateway === 'stripe') {
      return new StripePaymentProcessor();
    } else {
      throw new Error(`Pasarela de pago no soportada: ${gateway}`);
    }
  }

  static createRefundManager(gateway) {
    if (gateway === 'paypal') {
      return new PayPalRefundManager();
    } else if (gateway === 'stripe') {
      return new StripeRefundManager();
    } else {
      throw new Error(`Pasarela de pago no soportada: ${gateway}`);
    }
  }
}

/**
 * Servicio de gestión de pagos con SQLite
 */
const paymentsService = {
  /**
   * Obtiene todos los pagos
   * @returns {Object} Lista de pagos
   */
  getAllPayments: async () => {
    try {
      const payments = await Payment.findAll({
        order: [['fecha', 'DESC']]
      });
      return { success: true, payments };
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      return { success: false, message: 'Error al obtener pagos' };
    }
  },
  
  /**
   * Obtiene los pagos de una orden específica
   * @param {number} orderId - ID de la orden
   * @returns {Object} Lista de pagos de la orden
   */
  getOrderPayments: async (orderId) => {
    try {
      const payments = await Payment.findAll({
        where: { pedido_id: orderId },
        order: [['fecha', 'DESC']]
      });
      
      return { success: true, payments };
    } catch (error) {
      console.error('Error al obtener pagos de la orden:', error);
      return { success: false, message: 'Error al obtener pagos de la orden' };
    }
  },
  
  /**
   * Obtiene un pago por su ID
   * @param {number} paymentId - ID del pago
   * @returns {Object} Pago encontrado o error
   */
  getPaymentById: async (paymentId) => {
    try {
      const payment = await Payment.findByPk(paymentId);
      
      if (!payment) {
        return { success: false, message: 'Pago no encontrado' };
      }
      
      return { success: true, payment };
    } catch (error) {
      console.error('Error al obtener pago:', error);
      return { success: false, message: 'Error al obtener pago' };
    }
  },
  
  /**
   * Procesa el pago de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} gateway - Pasarela de pago ('paypal' o 'stripe')
   * @param {Object} orderData - Datos de la orden (temporal para evitar dependencia del servicio de órdenes)
   * @returns {Object} Resultado del procesamiento
   */
  processPayment: async (orderId, gateway, orderData = null) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Validar pasarela
      if (!config.PAYMENT_GATEWAYS.includes(gateway)) {
        await transaction.rollback();
        return { success: false, message: 'Pasarela de pago no válida' };
      }
      
      const orderResult = await ordersClient.getOrderById(orderId);
      
      if (!orderResult) {
        await transaction.rollback();
        return { success: false, message: 'Datos de orden no proporcionados' };
      }
      
      const order = orderResult.order;
      
      // Verificar si la orden ya fue pagada
      const existingPayment = await Payment.findOne({
        where: { 
          pedido_id: orderId,
          estado: config.PAYMENT_STATUSES.COMPLETED
        },
        transaction
      });
      
      if (existingPayment) {
        await transaction.rollback();
        return { success: false, message: 'La orden ya ha sido pagada' };
      }
      
      // Crear procesador de pagos según la pasarela
      const paymentProcessor = PaymentProcessorFactory.createPaymentProcessor(gateway);
      
      // Procesar pago
      const paymentResult = paymentProcessor.processPayment(order);
      
      if (!paymentResult.success) {
        await transaction.rollback();
        return paymentResult;
      }
      
      // Crear registro de pago
      const newPayment = await Payment.create({
        pedido_id: orderId,
        transaccion_id: paymentResult.transactionId,
        respuesta: paymentResult.message,
        estado: config.PAYMENT_STATUSES.COMPLETED,
        monto: order.total,
        pasarela: gateway
      }, { transaction });
      
      await ordersClient.updatePaymentStatus(orderId, config.PAYMENT_STATUSES.COMPLETED);
      
      await transaction.commit();
      
      return { 
        success: true, 
        message: 'Pago procesado correctamente',
        payment: newPayment
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error al procesar pago:', error);
      return { success: false, message: 'Error al procesar pago' };
    }
  },
  
  /**
   * Cancela un pago
   * @param {number} paymentId - ID del pago
   * @returns {Object} Resultado de la operación
   */
  cancelPayment: async (paymentId) => {
    const transaction = await sequelize.transaction();
    
    try {
      const payment = await Payment.findByPk(paymentId, { transaction });
      
      if (!payment) {
        await transaction.rollback();
        return { success: false, message: 'Pago no encontrado' };
      }
      
      // Verificar si el pago puede ser cancelado
      if (payment.estado !== config.PAYMENT_STATUSES.PENDING) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `No se puede cancelar un pago en estado ${payment.estado}` 
        };
      }
      
      // Cancelar pago en la pasarela si hay una transacción
      if (payment.transaccion_id) {
        const paymentProcessor = PaymentProcessorFactory.createPaymentProcessor(payment.pasarela);
        paymentProcessor.cancelPayment(payment.transaccion_id);
      }
      
      // Actualizar estado del pago
      payment.estado = 'CANCELLED';
      payment.respuesta = 'Pago cancelado por el usuario';
      await payment.save({ transaction });
      
      await ordersClient.updatePaymentStatus(payment.pedido_id, 'CANCELLED');
      
      await transaction.commit();
      
      return { 
        success: true, 
        message: 'Pago cancelado correctamente',
        payment
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error al cancelar pago:', error);
      return { success: false, message: 'Error al cancelar pago' };
    }
  },
  
  /**
   * Procesa un reembolso
   * @param {number} paymentId - ID del pago
   * @param {number} amount - Monto a reembolsar (opcional)
   * @returns {Object} Resultado del reembolso
   */
  processRefund: async (paymentId, amount) => {
    const transaction = await sequelize.transaction();
    
    try {
      const payment = await Payment.findByPk(paymentId, { transaction });
      
      if (!payment) {
        await transaction.rollback();
        return { success: false, message: 'Pago no encontrado' };
      }
      
      // Verificar si el pago puede ser reembolsado
      if (payment.estado !== config.PAYMENT_STATUSES.COMPLETED) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `Solo se pueden reembolsar pagos completados` 
        };
      }
      
      // Si no se especifica monto, reembolsar el total
      const refundAmount = amount || payment.monto;
      
      // Verificar que el monto a reembolsar no exceda el monto del pago
      if (refundAmount > payment.monto) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `El monto a reembolsar no puede exceder el monto del pago` 
        };
      }
      
      // Procesar reembolso en la pasarela
      const refundManager = PaymentProcessorFactory.createRefundManager(payment.pasarela);
      const refundResult = refundManager.processRefund(payment.transaccion_id, refundAmount);
      
      if (!refundResult.success) {
        await transaction.rollback();
        return refundResult;
      }
      
      // Actualizar estado del pago
      payment.estado = config.PAYMENT_STATUSES.REFUNDED;
      payment.respuesta = `Reembolso procesado: ${refundResult.message}`;
      await payment.save({ transaction });
      
      await ordersClient.updatePaymentStatus(payment.pedido_id, config.PAYMENT_STATUSES.REFUNDED);
      
      await transaction.commit();
      
      return { 
        success: true, 
        message: 'Reembolso procesado correctamente',
        refund: refundResult,
        payment
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error al procesar reembolso:', error);
      return { success: false, message: 'Error al procesar reembolso' };
    }
  }
};

module.exports = paymentsService;