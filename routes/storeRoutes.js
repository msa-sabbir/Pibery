const express = require('express');
const router = express.Router();
const {
  getPlatformOverview,
  listAllShops,
  toggleShopActive,
  deleteShop,
  listAllMerchants,
  toggleMerchantStatus,
  updateMerchantPlan,
  broadcastAnnouncement,
  renderOwnerDashboard,
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

// ---------- প্ল্যাটফর্ম ওনার প্যানেল API (protected + owner-only) ----------
router.get('/platform/overview', protect, authorize('owner'), getPlatformOverview);
router.get('/platform/shops', protect, authorize('owner'), listAllShops);
router.patch('/platform/shops/:id/toggle-active', protect, authorize('owner'), toggleShopActive);
router.delete('/platform/shops/:id', protect, authorize('owner'), deleteShop);

router.get('/platform/merchants', protect, authorize('owner'), listAllMerchants);
router.patch('/platform/merchants/:id/status', protect, authorize('owner'), toggleMerchantStatus);
router.patch('/platform/merchants/:id/plan', protect, authorize('owner'), updateMerchantPlan);
router.post('/platform/broadcast', protect, authorize('owner'), broadcastAnnouncement);

module.exports = router;
