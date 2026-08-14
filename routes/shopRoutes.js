const express = require('express');
const router = express.Router();
const { createShop, getShopDetails } = require('../controllers/shopController');

router.post('/create', createShop);
router.get('/:subdomain', getShopDetails);

module.exports = router;
