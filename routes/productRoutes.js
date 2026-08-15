const express = require('express');
const router = express.Router();
const {
  createProduct,
  getShopProducts,
  getStorefrontProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/storefront/:shopId', getStorefrontProducts); // পাবলিক
router.get('/:id', getProduct); // পাবলিক

router.use(protect);
router.post('/', createProduct);
router.get('/shop/:shopId', getShopProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

module.exports = router;
 