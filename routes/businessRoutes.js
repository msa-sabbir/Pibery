const express = require('express');
const router = express.Router();
const { createOrder, updateOrderStatus, getReceipt } = require('../controllers/businessController');

router.post('/order/create', createOrder);
router.put('/order/status', updateOrderStatus);
router.get('/order/receipt/:orderId', getReceipt);

module.exports = router;
 