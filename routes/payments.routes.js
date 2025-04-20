const express = require('express');
const router = express.Router();
const paymentsService = require('../services/payments.service');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const ordersService = require('../services/orders.service');

/**
 * @route GET /api/payments
 * @desc Obtener todos los pagos (solo admin)
 * @access Private/Admin
 */
router.get('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const result = paymentsService.getAllPayments();
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      payments: result.payments
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/payments/order/:orderId
 * @desc Obtener pagos de una orden específica
 * @access Private
 */
router.get('/order/:orderId', verifyToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    // Verificar si el usuario tiene permiso para ver los pagos de la orden
    const orderCheck = ordersService.getOrderById(orderId);
    
    if (!orderCheck.success) {
      return res.status(404).json({ status: 'error', message: orderCheck.message });
    }
    
    // Solo admin o dueño de la orden pueden ver los pagos
    if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para ver los pagos de esta orden'
      });
    }
    
    const result = paymentsService.getOrderPayments(orderId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      payments: result.payments
    });
  } catch (error) {
    console.error('Error al obtener pagos de la orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/payments/:id
 * @desc Obtener un pago por ID
 * @access Private
 */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const result = paymentsService.getPaymentById(paymentId);
    
    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }
    
    // Verificar permiso para ver el pago
    const orderCheck = ordersService.getOrderById(result.payment.pedido_id);
    
    if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para ver este pago'
      });
    }
    
    res.status(200).json({
      status: 'success',
      payment: result.payment
    });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/payments/process
 * @desc Procesar un pago para una orden
 * @access Private
 */
router.post('/process', verifyToken, async (req, res) => {
  try {
    const { orderId, gateway } = req.body;
    
    if (!orderId || !gateway) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID de la orden y la pasarela de pago son requeridos'
      });
    }
    
    // Verificar si el usuario tiene permiso para pagar la orden
    const orderCheck = ordersService.getOrderById(orderId);
    
    if (!orderCheck.success) {
      return res.status(404).json({ status: 'error', message: orderCheck.message });
    }
    
    if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para pagar esta orden'
      });
    }
    
    const result = await paymentsService.processPayment(orderId, gateway);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      payment: result.payment
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route DELETE /api/payments/:id
 * @desc Cancelar un pago
 * @access Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const paymentCheck = paymentsService.getPaymentById(paymentId);
    
    if (!paymentCheck.success) {
      return res.status(404).json({ status: 'error', message: paymentCheck.message });
    }
    
    // Verificar permiso para cancelar el pago
    const orderCheck = ordersService.getOrderById(paymentCheck.payment.pedido_id);
    
    if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para cancelar este pago'
      });
    }
    
    const result = await paymentsService.cancelPayment(paymentId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      payment: result.payment
    });
  } catch (error) {
    console.error('Error al cancelar pago:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/payments/:id/refund
 * @desc Procesar un reembolso
 * @access Private/Admin
 */
router.post('/:id/refund', [verifyToken, isAdmin], async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { amount } = req.body;
    
    const result = await paymentsService.processRefund(paymentId, amount);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      refund: result.refund,
      payment: result.payment
    });
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;