const express = require('express');
const router = express.Router();
const { getDashboardStats, browseProducts, applyCoupon, requestReturn } = require('../controllers/storeController');

router.get('/admin/stats/:shopId', getDashboardStats);
router.get('/store/products', browseProducts);
router.post('/store/coupon/apply', applyCoupon);
router.post('/store/order/return', requestReturn);

module.exports = router;
