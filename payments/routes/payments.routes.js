const express = require('express');
const router = express.Router();
const paymentsService = require('../services/payments.service');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const ordersService = require('../../orders/services/orders.service');
const { response } = require('..');

/**
 * @route GET /api/payments
 * @desc Obtener todos los pagos (solo admin)
 * @access Private/Admin
 */
router.get('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const result = paymentsService.getAllPayments();
    result.then(
      (response) => {
        if (!response.success) {
          return res.status(400).json({ status: 'error', message: response.message });
        }
        res.status(200).json({
          status: 'success',
          payments: response.payments
        });
      }
    )
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

    orderCheck.then((response) => {
      if (!response.success) {
        return res.status(404).json({ status: 'error', message: response.message });
      }

      // Solo admin o dueño de la orden pueden ver los pagos
      if (req.user.role !== 'admin' && response.order.cliente_id !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para ver los pagos de esta orden'
        });
      }
    })


    const result = paymentsService.getOrderPayments(orderId);

    result.then(
      (response) => {
        if (!response.success) {
          return res.status(400).json({ status: 'error', message: response.message });
        }

        res.status(200).json({
          status: 'success',
          payments: response.payments
        });
      }
    )

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


    result.then((
      response
    ) => {
      if (!response.success) {
        return res.status(404).json({ status: 'error', message: response.message });
      }

      // Verificar permiso para ver el pago
      const orderCheck = ordersService.getOrderById(response.payment.pedido_id);

      if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para ver este pago'
        });
      }

      res.status(200).json({
        status: 'success',
        payment: response.payment
      });
    })


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

    orderCheck.then((response) => {
      if (!response.success) {
        return res.status(404).json({ status: 'error', message: response.message });
      }

      if (req.user.role !== 'admin' && response.order.cliente_id !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para pagar esta orden'
        });
      }
    })



    const result = await paymentsService.processPayment(orderId, gateway);

    result.then((response) => {
      if (!response.success) {
        return res.status(400).json({ status: 'error', message: response.message });
      }

      res.status(200).json({
        status: 'success',
        message: response.message,
        payment: response.payment
      });
    })


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

    paymentCheck.then((response) => {

      if (!response.success) {
        return res.status(404).json({ status: 'error', message: response.message });
      }

      // Verificar permiso para cancelar el pago
      const orderCheck = ordersService.getOrderById(response.payment.pedido_id);

      orderCheck.then((response_order) => {
        if (req.user.role !== 'admin' && response_order.order.cliente_id !== req.user.id) {
          return res.status(403).json({
            status: 'error',
            message: 'No tienes permiso para cancelar este pago'
          });
        }
      })
    })

    const result = await paymentsService.cancelPayment(paymentId);

    result.then((response) => {
      if (!response.success) {
        return res.status(400).json({ status: 'error', message: response.message });
      }

      res.status(200).json({
        status: 'success',
        message: response.message,
        payment: response.payment
      });
    })
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

    result.then((response) => {
      if (!response.success) {
        return res.status(400).json({ status: 'error', message: response.message });
      }
      res.status(200).json({
        status: 'success',
        message: response.message,
        refund: response.refund,
        payment: response.payment
      });
    })

  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;