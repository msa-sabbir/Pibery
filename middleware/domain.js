/**
 * Pibery Platform - Custom Domain & Subdomain Routing Middleware
 * Allows merchants to use their own domains (e.g. mystore.com) alongside subdomains (mystore.pibery.online).
 */

const Shop = require('../models/Shop');

exports.resolveCustomDomain = async (req, res, next) => {
  try {
    const host = req.headers.host || ''; // e.g. mystore.com or localhost:3000
    const hostname = host.split(':')[0];

    // Skip for platform main domain or localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('pibery.online')) {
      return next();
    }

    // Lookup shop by custom domain
    const shop = await Shop.findOne({ customDomain: hostname, isActive: true, isPublished: true });
    if (shop) {
      req.params.subdomain = shop.subdomain;
      req.resolvedShop = shop;
    }

    next();
  } catch (err) {
    next();
  }
};
