const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  numeroPedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'numero_pedido'
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estadoPedido: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING',
    field: 'estado_pedido'
  },
  estadoPago: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING',
    field: 'estado_pago'
  },
  metodoPago: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'metodo_pago'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  underscored: true
});

module.exports = Order;