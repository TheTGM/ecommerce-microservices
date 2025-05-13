require("dotenv").config();

module.exports = {
  PORT: 3002,
  JWT_SECRET: process.env.JWT_SECRET || "secreto-del-jwt-para-desarrollo",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "600h",

  // Opciones para bcrypt
  SALT_ROUNDS: 10,

  // Pasarelas de pago disponibles
  PAYMENT_GATEWAYS: ["paypal", "stripe"],

  // Estados de pedido
  ORDER_STATUSES: {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  },

  // Estados de pago
  PAYMENT_STATUSES: {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
  },
};
