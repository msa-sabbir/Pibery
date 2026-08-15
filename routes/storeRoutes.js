const express = require('express');
const router = express.Router();
const {
  getPlatformOverview,
  listAllShops,
  toggleShopActive,
  registerCustomer,
  checkout,
  trackOrder,
  getLoyalty,
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');

// ---------- শপফ্রন্ট (পাবলিক) ----------
router.post('/customers/register', registerCustomer);
router.post('/checkout', checkout);
router.get('/orders/track/:orderId', trackOrder);
router.get('/customers/:id/loyalty', getLoyalty);

// ---------- প্ল্যাটফর্ম ওনার প্যানেল (protected + owner-only) ----------
router.get('/platform/overview', protect, authorize('owner'), getPlatformOverview);
router.get('/platform/shops', protect, authorize('owner'), listAllShops);
router.patch('/platform/shops/:id/toggle-active', protect, authorize('owner'), toggleShopActive);

module.exports = router;
