const express = require('express');
const router = express.Router();
const {
  createShop,
  getMyShops,
  getShop,
  updateShop,
  deleteShop,
  getShopBySubdomain,
} = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

router.get('/subdomain/:subdomain', getShopBySubdomain); // পাবলিক - স্টোরফ্রন্ট রেজল্ভ করার জন্য

router.use(protect);
router.post('/', createShop);
router.get('/mine', getMyShops);
router.get('/:id', getShop);
router.put('/:id', updateShop);
router.delete('/:id', deleteShop);

module.exports = router;
