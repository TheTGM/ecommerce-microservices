const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const ordersService = require('./orders.service');

// Path al archivo JSON de pagos
const paymentsFilePath = path.join(__dirname, '../data/payments.json');

// Función para leer el archivo de pagos
const getPayments = () => {
  try {
    const data = fs.readFileSync(paymentsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de pagos:', error);
    return [];
  }
};

// Función para escribir en el archivo de pagos
const savePayments = (payments) => {
  try {
    fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de pagos:', error);
    return false;
  }
};

// ==================== ABSTRACT FACTORY PATTERN ====================

/**
 * Procesador de Pagos Abstracto
 * Define la interfaz para todos los procesadores de pago
 */
class PaymentProcessor {
  /**
   * Procesa el pago de una orden
   * @param {Object} order - Datos de la orden
   * @returns {Object} Resultado del procesamiento del pago
   */
  processPayment(order) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  /**
   * Verifica el estado de un pago
   * @param {string} transactionId - ID de la transacción
   * @returns {Object} Estado del pago
   */
  getPaymentStatus(transactionId) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  /**
   * Cancela un pago
   * @param {string} transactionId - ID de la transacción
   * @returns {Object} Resultado de la cancelación
   */
  cancelPayment(transactionId) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }
}

/**
 * Gestor de Reembolsos Abstracto
 * Define la interfaz para todos los gestores de reembolso
 */
class RefundManager {
  /**
   * Procesa un reembolso
   * @param {string} transactionId - ID de la transacción
   * @param {number} amount - Monto a reembolsar
   * @returns {Object} Resultado del procesamiento del reembolso
   */
  processRefund(transactionId, amount) {
    throw new Error("Método abstracto - debe ser implementado por subclases");
  }

  /**
   * Verifica el estado de un reembolso
   * @param {string} refundId - ID del reembolso
   * @returns {Object} Estado del reembolso
   */
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
  /**
   * Crea un procesador de pagos según la pasarela
   * @param {string} gateway - Nombre de la pasarela ('paypal' o 'stripe')
   * @returns {PaymentProcessor} Instancia de procesador de pagos
   */
  static createPaymentProcessor(gateway) {
    if (gateway === 'paypal') {
      return new PayPalPaymentProcessor();
    } else if (gateway === 'stripe') {
      return new StripePaymentProcessor();
    } else {
      throw new Error(`Pasarela de pago no soportada: ${gateway}`);
    }
  }

  /**
   * Crea un gestor de reembolsos según la pasarela
   * @param {string} gateway - Nombre de la pasarela ('paypal' o 'stripe')
   * @returns {RefundManager} Instancia de gestor de reembolsos
   */
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
 * Servicio de gestión de pagos
 */
const paymentsService = {
  /**
   * Obtiene todos los pagos
   * @returns {Array} Lista de pagos
   */
  getAllPayments: () => {
    try {
      const payments = getPayments();
      return { success: true, payments };
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      return { success: false, message: 'Error al obtener pagos' };
    }
  },
  
  /**
   * Obtiene los pagos de una orden específica
   * @param {number} orderId - ID de la orden
   * @returns {Array} Lista de pagos de la orden
   */
  getOrderPayments: (orderId) => {
    try {
      const payments = getPayments();
      const orderPayments = payments.filter(payment => payment.pedido_id === orderId);
      
      return { success: true, payments: orderPayments };
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
  getPaymentById: (paymentId) => {
    try {
      const payments = getPayments();
      
      const payment = payments.find(p => p.id === paymentId);
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
   * @returns {Object} Resultado del procesamiento
   */
  processPayment: async (orderId, gateway) => {
    try {
      // Validar pasarela
      if (!config.PAYMENT_GATEWAYS.includes(gateway)) {
        return { success: false, message: 'Pasarela de pago no válida' };
      }
      
      // Obtener orden
      const orderResult = ordersService.getOrderById(orderId);
      if (!orderResult.success) {
        return { success: false, message: orderResult.message };
      }
      
      const order = orderResult.order;
      
      // Verificar si la orden ya fue pagada
      if (order.estadoPago === config.PAYMENT_STATUSES.COMPLETED) {
        return { success: false, message: 'La orden ya ha sido pagada' };
      }
      
      // Crear procesador de pagos según la pasarela
      const paymentProcessor = PaymentProcessorFactory.createPaymentProcessor(gateway);
      
      // Procesar pago
      const paymentResult = paymentProcessor.processPayment(order);
      
      if (!paymentResult.success) {
        return paymentResult;
      }
      
      // Actualizar estado de pago de la orden
      ordersService.updatePaymentStatus(orderId, config.PAYMENT_STATUSES.COMPLETED);
      
      // Registrar pago
      const payments = getPayments();
      
      const newPayment = {
        id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 2001,
        pedido_id: orderId,
        transaccion_id: paymentResult.transactionId,
        respuesta: paymentResult.message,
        estado: config.PAYMENT_STATUSES.COMPLETED,
        monto: order.total,
        pasarela: gateway,
        fecha: new Date().toISOString()
      };
      
      payments.push(newPayment);
      savePayments(payments);
      
      return { 
        success: true, 
        message: 'Pago procesado correctamente',
        payment: newPayment
      };
    } catch (error) {
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
    try {
      const payments = getPayments();
      
      const paymentIndex = payments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) {
        return { success: false, message: 'Pago no encontrado' };
      }
      
      const payment = payments[paymentIndex];
      
      // Verificar si el pago puede ser cancelado
      if (payment.estado !== config.PAYMENT_STATUSES.PENDING) {
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
      payments[paymentIndex].estado = 'CANCELLED';
      payments[paymentIndex].respuesta = 'Pago cancelado por el usuario';
      
      // Guardar cambios
      savePayments(payments);
      
      // Actualizar estado de la orden
      ordersService.updatePaymentStatus(payment.pedido_id, 'CANCELLED');
      
      return { 
        success: true, 
        message: 'Pago cancelado correctamente',
        payment: payments[paymentIndex]
      };
    } catch (error) {
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
    try {
      const payments = getPayments();
      
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        return { success: false, message: 'Pago no encontrado' };
      }
      
      // Verificar si el pago puede ser reembolsado
      if (payment.estado !== config.PAYMENT_STATUSES.COMPLETED) {
        return { 
          success: false, 
          message: `Solo se pueden reembolsar pagos completados` 
        };
      }
      
      // Si no se especifica monto, reembolsar el total
      const refundAmount = amount || payment.monto;
      
      // Verificar que el monto a reembolsar no exceda el monto del pago
      if (refundAmount > payment.monto) {
        return { 
          success: false, 
          message: `El monto a reembolsar no puede exceder el monto del pago` 
        };
      }
      
      // Procesar reembolso en la pasarela
      const refundManager = PaymentProcessorFactory.createRefundManager(payment.pasarela);
      const refundResult = refundManager.processRefund(payment.transaccion_id, refundAmount);
      
      if (!refundResult.success) {
        return refundResult;
      }
      
      // Actualizar estado del pago
      const paymentIndex = payments.findIndex(p => p.id === paymentId);
      payments[paymentIndex].estado = config.PAYMENT_STATUSES.REFUNDED;
      payments[paymentIndex].respuesta = `Reembolso procesado: ${refundResult.message}`;
      
      // Guardar cambios
      savePayments(payments);
      
      // Actualizar estado de la orden
      ordersService.updatePaymentStatus(payment.pedido_id, config.PAYMENT_STATUSES.REFUNDED);
      
      return { 
        success: true, 
        message: 'Reembolso procesado correctamente',
        refund: refundResult,
        payment: payments[paymentIndex]
      };
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      return { success: false, message: 'Error al procesar reembolso' };
    }
  }
};

module.exports = paymentsService;