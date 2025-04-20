const express = require('express');
const router = express.Router();
const ordersService = require('../services/orders.service');
const { verifyToken, isAdmin, hasRole } = require('../middlewares/auth.middleware');

/**
 * @route GET /api/orders
 * @desc Obtener todas las órdenes (solo admin)
 * @access Private/Admin
 */
router.get('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const result = ordersService.getAllOrders();
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      orders: result.orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/orders/my
 * @desc Obtener órdenes del cliente autenticado
 * @access Private
 */
router.get('/my', verifyToken, (req, res) => {
  try {
    const clientId = req.user.id;
    const result = ordersService.getClientOrders(clientId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      orders: result.orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes del cliente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/orders/:id
 * @desc Obtener una orden por ID
 * @access Private
 */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const result = ordersService.getOrderById(orderId);
    
    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }
    
    // Verificar que el usuario sea admin o el dueño de la orden
    if (req.user.role !== 'admin' && result.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para ver esta orden'
      });
    }
    
    res.status(200).json({
      status: 'success',
      order: result.order
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/orders
 * @desc Crear una nueva orden
 * @access Private
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // Asegurar que el cliente_id sea el del usuario autenticado
    const orderData = {
      ...req.body,
      cliente_id: req.user.id
    };
    
    const result = await ordersService.createOrder(orderData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Orden creada exitosamente',
      order: result.order
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PATCH /api/orders/:id/status
 * @desc Actualizar el estado de una orden
 * @access Private/Admin
 */
router.patch('/:id/status', [verifyToken, isAdmin], (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'El estado es requerido'
      });
    }
    
    const result = ordersService.updateOrderStatus(orderId, status);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Estado de orden actualizado exitosamente',
      order: result.order
    });
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route DELETE /api/orders/:id
 * @desc Cancelar una orden
 * @access Private
 */
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Verificar si el usuario tiene permiso para cancelar la orden
    const orderCheck = ordersService.getOrderById(orderId);
    
    if (!orderCheck.success) {
      return res.status(404).json({ status: 'error', message: orderCheck.message });
    }
    
    // Solo admin o dueño de la orden pueden cancelarla
    if (req.user.role !== 'admin' && orderCheck.order.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para cancelar esta orden'
      });
    }
    
    const result = ordersService.cancelOrder(orderId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      order: result.order
    });
  } catch (error) {
    console.error('Error al cancelar orden:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;