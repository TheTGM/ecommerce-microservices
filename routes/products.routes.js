const express = require('express');
const router = express.Router();
const productsService = require('../services/products.service');
const { verifyToken, isAdmin, hasRole } = require('../middlewares/auth.middleware');

/**
 * @route GET /api/products
 * @desc Obtener todos los productos activos
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const result = productsService.getAllProducts();
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      products: result.products
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/products/admin
 * @desc Obtener todos los productos (incluyendo inactivos)
 * @access Private/Admin
 */
router.put('/:id', [verifyToken, isAdmin], (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    
    const result = productsService.updateProduct(productId, productData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      product: result.product
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route DELETE /api/products/:id
 * @desc Eliminar un producto (desactivación lógica)
 * @access Private/Admin
 */
router.delete('/:id', [verifyToken, isAdmin], (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const result = productsService.deleteProduct(productId);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PATCH /api/products/:id/stock
 * @desc Actualizar el stock de un producto
 * @access Private/Admin
 */
router.patch('/:id/stock', [verifyToken, isAdmin], (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad es requerida'
      });
    }
    
    const result = productsService.updateStock(productId, parseInt(quantity));
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      currentStock: result.currentStock
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

router.get('/admin', [verifyToken, isAdmin], (req, res) => {
  try {
    const result = productsService.getAllProductsAdmin();
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      products: result.products
    });
  } catch (error) {
    console.error('Error al obtener productos para admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/products/:id
 * @desc Obtener un producto por ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = productsService.getProductById(productId);
    
    if (!result.success) {
      return res.status(404).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      product: result.product
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/products
 * @desc Crear un nuevo producto
 * @access Private/Admin
 */
router.post('/', [verifyToken, isAdmin], (req, res) => {
  try {
    const productData = req.body;
    const result = productsService.createProduct(productData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      product: result.product
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PUT /api/products/:id
 * @desc Actualizar un producto existente
 * @access Private/Admin
 */
router.put('/:id', [verifyToken, isAdmin], (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const result = productsService.updateProduct(productId, productData);
    
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      product: result.product
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      status: 'error',    
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;