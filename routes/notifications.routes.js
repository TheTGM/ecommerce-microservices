const express = require('express');
const router = express.Router();
const notificationsService = require('../services/notifications.service');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @route GET /api/notifications
 * @desc Obtener todas las notificaciones (solo admin)
 * @access Private/Admin
 */
router.get('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const result = notificationsService.getAllNotifications();
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      notifications: result.notifications
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/notifications/my
 * @desc Obtener notificaciones del cliente autenticado
 * @access Private
 */
router.get('/my', verifyToken, (req, res) => {
  try {
    const clientId = req.user.id;
    const result = notificationsService.getClientNotifications(clientId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      notifications: result.notifications
    });
  } catch (error) {
    console.error('Error al obtener notificaciones del cliente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/notifications/:id
 * @desc Obtener una notificación por ID
 * @access Private
 */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const result = notificationsService.getNotificationById(notificationId);
    
    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }
    
    // Verificar si el usuario tiene permiso para ver la notificación
    if (req.user.role !== 'admin' && result.notification.cliente_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para ver esta notificación'
      });
    }
    
    res.status(200).json({
      status: 'success',
      notification: result.notification
    });
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/notifications
 * @desc Crear una nueva notificación (solo admin)
 * @access Private/Admin
 */
router.post('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const notificationData = req.body;
    const result = notificationsService.createNotification(notificationData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Notificación creada exitosamente',
      notification: result.notification
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PATCH /api/notifications/:id/mark-sent
 * @desc Marcar una notificación como enviada (solo admin)
 * @access Private/Admin
 */
router.patch('/:id/mark-sent', [verifyToken, isAdmin], (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const result = notificationsService.markAsSent(notificationId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Notificación marcada como enviada',
      notification: result.notification
    });
  } catch (error) {
    console.error('Error al marcar notificación como enviada:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/notifications/send-promotion
 * @desc Enviar una notificación promocional (solo admin)
 * @access Private/Admin
 */
router.post('/send-promotion', [verifyToken, isAdmin], (req, res) => {
  try {
    const { clientId, mensaje, programadaPara } = req.body;
    
    if (!mensaje) {
      return res.status(400).json({
        status: 'error',
        message: 'El mensaje es requerido'
      });
    }
    
    const result = notificationsService.sendPromotionNotification(clientId, mensaje, programadaPara);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Notificación promocional enviada exitosamente',
      notification: result.notification
    });
  } catch (error) {
    console.error('Error al enviar notificación promocional:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/notifications/send-order-status
 * @desc Enviar una notificación de estado de pedido (solo admin)
 * @access Private/Admin
 */
router.post('/send-order-status', [verifyToken, isAdmin], (req, res) => {
  try {
    const { orderId, clientId, status } = req.body;
    
    if (!orderId || !clientId || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'El ID de la orden, ID del cliente y estado son requeridos'
      });
    }
    
    const result = notificationsService.sendOrderStatusNotification(orderId, clientId, status);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Notificación de estado de pedido enviada exitosamente',
      notification: result.notification
    });
  } catch (error) {
    console.error('Error al enviar notificación de estado de pedido:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;