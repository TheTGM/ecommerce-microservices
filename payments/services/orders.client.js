// services/orders.client.js
const HttpClient = require('../utils/httpClient');
const config = require('../config/config');

class OrdersClient {
  constructor() {
    // La URL base se configurará mediante variables de entorno
    this.httpClient = new HttpClient(process.env.ORDERS_SERVICE_URL || 'http://localhost:3001');
  }

  /**
   * Obtiene una orden por su ID
   * @param {number} orderId - ID de la orden
   * @param {string} token - Token de autenticación
   * @returns {Object} Orden encontrada
   */
  async getOrderById(orderId, token) {
    try {
      this.httpClient.setAuthToken(token);
      const response = await this.httpClient.get(`/api/orders/${orderId}`);
      
      if (response.status === 'success') {
        return {
          success: true,
          order: response.order
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error al obtener la orden'
        };
      }
    } catch (error) {
      console.error('Error al obtener orden:', error);
      return {
        success: false,
        message: error.message || 'Error al comunicarse con el servicio de órdenes'
      };
    }
  }

  /**
   * Actualiza el estado de pago de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} paymentStatus - Nuevo estado de pago
   * @param {string} token - Token de autenticación
   * @returns {Object} Resultado de la actualización
   */
  async updatePaymentStatus(orderId, paymentStatus, token) {
    try {
      this.httpClient.setAuthToken(token);
      const response = await this.httpClient.patch(
        `/api/orders/${orderId}/payment-status`,
        { paymentStatus }
      );
      
      if (response.status === 'success') {
        return {
          success: true,
          order: response.order
        };
      } else {
        return {
          success: false,
          message: response.message || 'Error al actualizar el estado de pago'
        };
      }
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      return {
        success: false,
        message: error.message || 'Error al comunicarse con el servicio de órdenes'
      };
    }
  }
}

module.exports = new OrdersClient();