const fs = require('fs');
const path = require('path');

// Path al archivo JSON de notificaciones
const notificationsFilePath = path.join(__dirname, '../data/notifications.json');

// Función para leer el archivo de notificaciones
const getNotifications = () => {
  try {
    const data = fs.readFileSync(notificationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de notificaciones:', error);
    return [];
  }
};

// Función para escribir en el archivo de notificaciones
const saveNotifications = (notifications) => {
  try {
    fs.writeFileSync(notificationsFilePath, JSON.stringify(notifications, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de notificaciones:', error);
    return false;
  }
};

/**
 * Servicio de gestión de notificaciones
 */
const notificationsService = {
  /**
   * Obtiene todas las notificaciones
   * @returns {Array} Lista de notificaciones
   */
  getAllNotifications: () => {
    try {
      const notifications = getNotifications();
      return { success: true, notifications };
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return { success: false, message: 'Error al obtener notificaciones' };
    }
  },
  
  /**
   * Obtiene las notificaciones de un cliente específico
   * @param {number} clientId - ID del cliente
   * @returns {Array} Lista de notificaciones del cliente
   */
  getClientNotifications: (clientId) => {
    try {
      const notifications = getNotifications();
      const clientNotifications = notifications.filter(notification => notification.cliente_id === clientId);
      
      return { success: true, notifications: clientNotifications };
    } catch (error) {
      console.error('Error al obtener notificaciones del cliente:', error);
      return { success: false, message: 'Error al obtener notificaciones del cliente' };
    }
  },
  
  /**
   * Obtiene una notificación por su ID
   * @param {number} notificationId - ID de la notificación
   * @returns {Object} Notificación encontrada o error
   */
  getNotificationById: (notificationId) => {
    try {
      const notifications = getNotifications();
      
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        return { success: false, message: 'Notificación no encontrada' };
      }
      
      return { success: true, notification };
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      return { success: false, message: 'Error al obtener notificación' };
    }
  },
  
  /**
   * Crea una nueva notificación
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Object} Notificación creada o error
   */
  createNotification: (notificationData) => {
    try {
      const notifications = getNotifications();
      
      // Validar datos mínimos
      if (!notificationData.cliente_id || !notificationData.mensaje || !notificationData.tipo) {
        return { 
          success: false, 
          message: 'Datos incompletos. Se requiere cliente_id, mensaje y tipo' 
        };
      }
      
      // Crear nueva notificación
      const newNotification = {
        id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 3001,
        cliente_id: notificationData.cliente_id,
        mensaje: notificationData.mensaje,
        tipo: notificationData.tipo,
        programada_para: notificationData.programada_para || new Date().toISOString(),
        enviada: notificationData.enviada || false,
        fecha_envio: notificationData.enviada ? new Date().toISOString() : null
      };
      
      // Guardar notificación
      notifications.push(newNotification);
      saveNotifications(notifications);
      
      return { success: true, notification: newNotification };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return { success: false, message: 'Error al crear notificación' };
    }
  },
  
  /**
   * Marca una notificación como enviada
   * @param {number} notificationId - ID de la notificación
   * @returns {Object} Notificación actualizada o error
   */
  markAsSent: (notificationId) => {
    try {
      const notifications = getNotifications();
      
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex === -1) {
        return { success: false, message: 'Notificación no encontrada' };
      }
      
      // Marcar como enviada
      notifications[notificationIndex].enviada = true;
      notifications[notificationIndex].fecha_envio = new Date().toISOString();
      
      // Guardar cambios
      saveNotifications(notifications);
      
      return { success: true, notification: notifications[notificationIndex] };
    } catch (error) {
      console.error('Error al marcar notificación como enviada:', error);
      return { success: false, message: 'Error al marcar notificación como enviada' };
    }
  },
  
  /**
   * Envía notificaciones de estado de pedido
   * @param {number} orderId - ID del pedido
   * @param {number} clientId - ID del cliente
   * @param {string} status - Estado del pedido
   * @returns {Object} Resultado de la operación
   */
  sendOrderStatusNotification: (orderId, clientId, status) => {
    try {
      // Crear mensaje según el estado
      let mensaje = '';
      
      switch (status) {
        case 'PENDING':
          mensaje = `Tu pedido #${orderId} ha sido recibido y está pendiente de pago.`;
          break;
        case 'PROCESSING':
          mensaje = `Tu pedido #${orderId} está siendo procesado. Te notificaremos cuando sea enviado.`;
          break;
        case 'SHIPPED':
          mensaje = `Tu pedido #${orderId} ha sido enviado y llegará en 3-5 días hábiles.`;
          break;
        case 'DELIVERED':
          mensaje = `Tu pedido #${orderId} ha sido entregado. ¡Gracias por tu compra!`;
          break;
        case 'CANCELLED':
          mensaje = `Tu pedido #${orderId} ha sido cancelado. Para más información, contáctanos.`;
          break;
        default:
          mensaje = `Actualización de tu pedido #${orderId}: estado ${status}.`;
      }
      
      // Crear notificación
      const notificationData = {
        cliente_id: clientId,
        mensaje,
        tipo: 'order_status',
        programada_para: new Date().toISOString(),
        enviada: true,
        fecha_envio: new Date().toISOString()
      };
      
      return this.createNotification(notificationData);
    } catch (error) {
      console.error('Error al enviar notificación de estado de pedido:', error);
      return { success: false, message: 'Error al enviar notificación de estado de pedido' };
    }
  },
  
  /**
   * Envía notificaciones de estado de pago
   * @param {number} orderId - ID del pedido
   * @param {number} clientId - ID del cliente
   * @param {string} status - Estado del pago
   * @returns {Object} Resultado de la operación
   */
  sendPaymentStatusNotification: (orderId, clientId, status) => {
    try {
      // Crear mensaje según el estado
      let mensaje = '';
      
      switch (status) {
        case 'PENDING':
          mensaje = `Tu pedido #${orderId} está pendiente de pago. Por favor, completa el proceso de pago.`;
          break;
        case 'COMPLETED':
          mensaje = `Hemos recibido el pago de tu pedido #${orderId}. ¡Gracias!`;
          break;
        case 'FAILED':
          mensaje = `El pago de tu pedido #${orderId} ha fallado. Por favor, intenta nuevamente.`;
          break;
        case 'REFUNDED':
          mensaje = `Hemos procesado el reembolso de tu pedido #${orderId}. El monto será acreditado en 3-5 días hábiles.`;
          break;
        default:
          mensaje = `Actualización del pago de tu pedido #${orderId}: estado ${status}.`;
      }
      
      // Crear notificación
      const notificationData = {
        cliente_id: clientId,
        mensaje,
        tipo: 'payment_status',
        programada_para: new Date().toISOString(),
        enviada: true,
        fecha_envio: new Date().toISOString()
      };
      
      return this.createNotification(notificationData);
    } catch (error) {
      console.error('Error al enviar notificación de estado de pago:', error);
      return { success: false, message: 'Error al enviar notificación de estado de pago' };
    }
  },
  
  /**
   * Envía una notificación promocional
   * @param {number} clientId - ID del cliente (puede ser null para todos los clientes)
   * @param {string} mensaje - Mensaje promocional
   * @param {Date} programadaPara - Fecha programada (opcional)
   * @returns {Object} Resultado de la operación
   */
  sendPromotionNotification: (clientId, mensaje, programadaPara = null) => {
    try {
      // Validar mensaje
      if (!mensaje) {
        return { success: false, message: 'El mensaje es obligatorio' };
      }
      
      // Crear notificación
      const notificationData = {
        cliente_id: clientId,
        mensaje,
        tipo: 'promotion',
        programada_para: programadaPara || new Date().toISOString(),
        enviada: false
      };
      
      return this.createNotification(notificationData);
    } catch (error) {
      console.error('Error al enviar notificación promocional:', error);
      return { success: false, message: 'Error al enviar notificación promocional' };
    }
  }
};

module.exports = notificationsService;