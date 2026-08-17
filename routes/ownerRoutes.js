const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const owner = require('../controllers/ownerController');

router.use(protect, authorize('owner'));

// Existing routes
router.get('/overview', owner.overview);
router.get('/users', owner.listUsers);
router.patch('/users/:id/toggle-active', owner.toggleUser);
router.get('/shops', owner.listShops);
router.patch('/shops/:id/toggle-active', owner.toggleShop);
router.delete('/shops/:id', owner.deleteShop);
router.get('/orders', owner.listOrders);
router.patch('/orders/:id', owner.updateOrder);

// New Professional Features
// Plans
router.get('/plans', owner.listPlans);
router.post('/plans', owner.createPlan);
router.patch('/plans/:id', owner.updatePlan);

// Announcements
router.get('/announcements', owner.listAnnouncements);
router.post('/announcements', owner.createAnnouncement);
router.delete('/announcements/:id', owner.deleteAnnouncement);

// Payouts
router.get('/payouts', owner.listPayouts);
router.patch('/payouts/:id', owner.updatePayout);

// Settings
router.get('/settings', owner.getSettings);
router.patch('/settings', owner.updateSettings);

module.exports = router;
