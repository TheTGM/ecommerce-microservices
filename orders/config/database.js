const { Sequelize } = require('sequelize');
const path = require('path');

// Configurar la conexión a SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/database.sqlite'),
  logging: false, // Puedes habilitarlo para ver las consultas SQL
  define: {
    timestamps: true,
    underscored: true, // Usar snake_case para los nombres de columnas
  }
});

module.exports = sequelize;