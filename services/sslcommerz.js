/**
 * Pibery Platform - SSLCommerz Payment Gateway Integration Service (Bangladesh)
 * Supports Sandbox & Live mode for merchant checkout.
 */

const axios = require('axios');

class SSLCommerzPayment {
  constructor(isLive = false) {
    this.isLive = isLive;
    this.sandboxUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
    this.liveUrl = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
    this.validationSandboxUrl = 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
    this.validationLiveUrl = 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
  }

  getApiUrl() {
    return this.isLive ? this.liveUrl : this.sandboxUrl;
  }

  async initPayment(paymentData) {
    try {
      const payload = {
        store_id: process.env.SSL_STORE_ID || 'testbox',
        store_passwd: process.env.SSL_STORE_PASSWORD || 'qwerty',
        total_amount: paymentData.totalAmount,
        currency: paymentData.currency || 'BDT',
        tran_id: paymentData.tranId,
        success_url: paymentData.successUrl || 'http://localhost:3000/api/store/payment/success',
        fail_url: paymentData.failUrl || 'http://localhost:3000/api/store/payment/fail',
        cancel_url: paymentData.cancelUrl || 'http://localhost:3000/api/store/payment/cancel',
        ipn_url: paymentData.ipnUrl || 'http://localhost:3000/api/store/payment/ipn',
        cus_name: paymentData.customerName || 'Customer',
        cus_email: paymentData.customerEmail || 'customer@pibery.online',
        cus_add1: paymentData.customerAddress || 'Dhaka',
        cus_phone: paymentData.customerPhone || '01700000000',
        shipping_method: 'Courier',
        product_name: paymentData.productName || 'E-commerce Order',
        product_category: 'General',
        product_profile: 'physical-goods',
      };

      // URL encoded form data
      const params = new URLSearchParams();
      for (const key in payload) {
        params.append(key, payload[key]);
      }

      const response = await axios.post(this.getApiUrl(), params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return {
        success: true,
        gatewayPageURL: response.data.GatewayPageURL,
        sessionkey: response.data.sessionkey,
        raw: response.data,
      };
    } catch (err) {
      return {
        success: false,
        message: 'SSLCommerz পেমেন্ট ইনিট লাইভ কল ব্যর্থ হয়েছে',
        error: err.message,
      };
    }
  }

  async validateTransaction(valId) {
    try {
      const vUrl = `${this.isLive ? this.validationLiveUrl : this.validationSandboxUrl}?val_id=${valId}&store_id=${process.env.SSL_STORE_ID || 'testbox'}&store_passwd=${process.env.SSL_STORE_PASSWORD || 'qwerty'}&format=json`;
      const res = await axios.get(vUrl);
      return res.data;
    } catch (err) {
      return { status: 'INVALID', error: err.message };
    }
  }
}

module.exports = new SSLCommerzPayment(false);
