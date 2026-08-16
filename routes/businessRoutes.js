const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getOrders,
  updateOrderStatus,
  getCustomers,
  getCustomerProfile,
  createCoupon,
  getCoupons,
  deleteCoupon,
} = require('../controllers/businessController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:shopId/dashboard', getDashboard);

router.get('/:shopId/orders', getOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

router.get('/:shopId/customers', getCustomers);
router.get('/customers/:customerId', getCustomerProfile);

router.post('/:shopId/marketing', createCoupon);
router.get('/:shopId/marketing', getCoupons);
router.delete('/marketing/:id', deleteCoupon);

module.exports = router;
