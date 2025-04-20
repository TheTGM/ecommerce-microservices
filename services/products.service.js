const fs = require('fs');
const path = require('path');

// Path al archivo JSON de productos
const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer el archivo de productos
const getProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de productos:', error);
    return [];
  }
};

// Función para escribir en el archivo de productos
const saveProducts = (products) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error al guardar el archivo de productos:', error);
    return false;
  }
};

/**
 * Servicio de gestión de productos
 */
const productsService = {
  /**
   * Obtiene todos los productos activos
   * @returns {Array} Lista de productos
   */
  getAllProducts: () => {
    try {
      const products = getProducts();
      // Solo devolver productos activos para clientes
      return { success: true, products: products.filter(p => p.activo) };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return { success: false, message: 'Error al obtener productos' };
    }
  },
  
  /**
   * Obtiene todos los productos (incluyendo inactivos) - Solo para administradores
   * @returns {Array} Lista completa de productos
   */
  getAllProductsAdmin: () => {
    try {
      const products = getProducts();
      return { success: true, products: products };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return { success: false, message: 'Error al obtener productos' };
    }
  },
  
  /**
   * Obtiene un producto por su ID
   * @param {number} productId - ID del producto
   * @returns {Object} Producto encontrado o error
   */
  getProductById: (productId) => {
    try {
      const products = getProducts();
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        return { success: false, message: 'Producto no encontrado' };
      }
      
      return { success: true, product };
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return { success: false, message: 'Error al obtener producto' };
    }
  },
  
  /**
   * Crea un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Object} Producto creado o error
   */
  createProduct: (productData) => {
    try {
      const products = getProducts();
      
      // Crear nuevo producto
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        nombre: productData.nombre,
        descripcion: productData.descripcion,
        precio: productData.precio,
        imagen_url: productData.imagen_url,
        stock_disponible: productData.stock_disponible,
        proveedor: productData.proveedor,
        costo: productData.costo,
        activo: productData.activo !== undefined ? productData.activo : true,
      };
      
      // Guardar producto
      products.push(newProduct);
      saveProducts(products);
      
      return { success: true, product: newProduct };
    } catch (error) {
      console.error('Error al crear producto:', error);
      return { success: false, message: 'Error al crear producto' };
    }
  },
  
  /**
   * Actualiza un producto existente
   * @param {number} productId - ID del producto
   * @param {Object} productData - Nuevos datos del producto
   * @returns {Object} Producto actualizado o error
   */
  updateProduct: (productId, productData) => {
    try {
      const products = getProducts();
      
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        return { success: false, message: 'Producto no encontrado' };
      }
      
      // Actualizar producto
      products[productIndex] = { ...products[productIndex], ...productData };
      
      // Guardar cambios
      saveProducts(products);
      
      return { success: true, product: products[productIndex] };
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return { success: false, message: 'Error al actualizar producto' };
    }
  },
  
  /**
   * Elimina un producto (inactivación lógica)
   * @param {number} productId - ID del producto
   * @returns {Object} Resultado de la operación
   */
  deleteProduct: (productId) => {
    try {
      const products = getProducts();
      
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        return { success: false, message: 'Producto no encontrado' };
      }
      
      // Inactivar producto (borrado lógico)
      products[productIndex].activo = false;
      
      // Guardar cambios
      saveProducts(products);
      
      return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return { success: false, message: 'Error al eliminar producto' };
    }
  },
  
  /**
   * Actualiza el stock de un producto
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a reducir (negativo) o añadir (positivo)
   * @returns {Object} Resultado de la operación
   */
  updateStock: (productId, quantity) => {
    try {
      const products = getProducts();
      
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        return { success: false, message: 'Producto no encontrado' };
      }
      
      // Validar que haya suficiente stock en caso de reducción
      if (quantity < 0 && products[productIndex].stock_disponible < Math.abs(quantity)) {
        return { success: false, message: 'Stock insuficiente' };
      }
      
      // Actualizar stock
      products[productIndex].stock_disponible += quantity;
      
      // Guardar cambios
      saveProducts(products);
      
      return { 
        success: true, 
        message: 'Stock actualizado correctamente',
        currentStock: products[productIndex].stock_disponible
      };
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      return { success: false, message: 'Error al actualizar stock' };
    }
  }
};

module.exports = productsService;