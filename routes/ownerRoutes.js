const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { overview, listUsers, toggleUser, listShops, toggleShop, listOrders, updateOrder, deleteShop } = require('../controllers/ownerController');

router.use(protect, authorize('owner'));
router.get('/overview', overview);
router.get('/users', listUsers);
router.patch('/users/:id/toggle-active', toggleUser);
router.get('/shops', listShops);
router.patch('/shops/:id/toggle-active', toggleShop);
router.delete('/shops/:id', deleteShop);
router.get('/orders', listOrders);
router.patch('/orders/:id', updateOrder);

module.exports = router;
