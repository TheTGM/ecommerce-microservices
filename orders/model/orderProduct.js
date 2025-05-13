const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./order');

const OrderProduct = sequelize.define('OrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'numero_pedido'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_products',
  underscored: true
});

// Definir las relaciones
Order.hasMany(OrderProduct, { as: 'productos', foreignKey: 'order_id', sourceKey: 'numeroPedido' });
OrderProduct.belongsTo(Order, { foreignKey: 'order_id', targetKey: 'numeroPedido' });

module.exports = OrderProduct;