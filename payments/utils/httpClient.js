// utils/httpClient.js
const axios = require('axios');

class HttpClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzExMTYwMywiZXhwIjoxNzQ5MjcxNjAzfQ.MxsT5Yzukoh5TH83c0IIozqcwYWkdUcc_F8Ar_NfOZ0'
      }
    });

    // Interceptor para logs
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP Request] ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP Request Error]', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[HTTP Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[HTTP Response Error]', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(url, data, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data
      };
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return {
        status: 0,
        message: 'No se pudo conectar con el servicio',
        data: null
      };
    } else {
      // Algo ocurrió al configurar la petición
      return {
        status: -1,
        message: error.message,
        data: null
      };
    }
  }
}

module.exports = HttpClient;